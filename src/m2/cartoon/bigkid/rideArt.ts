// The big-kid zone's rides, drawn (world space; the SNES pass). Every ride vehicle a real piece of theming, in steps
// (lit up and left, shaded down and right, inked, dithered seams); the still parts painted once for the hour into a
// stamp, only what moves drawn live (wheels turning, lights flashing, the dudes laughing, the clown's eyes spinning):
//
//   THE CRUISIN' COUCH   a plaid seventies sofa (tufted back, saggy cushions, rolled arms, a fringe skirt) bolted onto
//                        a go-kart chassis (chrome bumper, fat knobby tires, a tailpipe); two animatronic slacker teens
//                        sat in it (the tall blond pompadour in his blue tee, the long-haired one in his black band tee),
//                        cheese puffs and a remote on the arms, cup holders duct-taped on, the headlights on the front
//                        arm, the air horn, the safety flag on its whip. Parked dead: OUT OF ORDER on its sawhorse.
//   THE BUMPER CARS      fat fiberglass tubs (SPAZ the pink chihuahua, STINKY the dopey orange cat, #3) on a black
//                        rubber ring, a chrome trim, the seat, the wheel turning itself; the pole up to the grid on its
//                        spring, its warning light; the faces painted on their noses.
//   THE HURL-A-WHIRL     the round base on its casters (striped skirt, chaser lights), the barber-pole column, Giggles'
//                        head (purple tufts, bags under his eyes, five o'clock shadow, the painted grin round a sour
//                        mouth, a cigarette, a tiny party hat; the eyes spinning in the tell), the barf-bucket cars (a
//                        sick face on each, the handle).
//   THE POD              Detective Drake's simulator: a white egg banded in steps on four chrome hydraulic legs, its
//                        tinted window, the duck painted on its side, the beacon.
//   THE BOARD            RAD RAT's giant skateboard: the deck's flames, its trucks, the big urethane wheels, four seats
//                        with their lap bars down, nobody in them.
//   THROWN               traffic cones, the skate punk's board, Gloppy's loogies and their sticky puddles, churros.
//   THE GLOP PITS' LIP   the slime's near edge, banded and bulging, bubbles popping, junk bobbing in it.

import type { GameState } from '../../../m1/game/core/state';
import { signText, type Look } from '../../signLetters';
import { box, onScreen, hour, dimmed, INK, stamp, ramp6, rampH, ballR, eggR, checker, shadeAcross, type Ctx } from '../kit';
import { timeOfDay } from '../../timeOfDay';
import { bigkidOf, type Ride } from './state';
import { whirlCars, boardAt, COUCH_L, COUCH_H, CAR_L, CUP_W, CUP_H, POD_W, BOARD_L } from './rides';
import { RINK, WHIRL, PIPE, PITS, X, Y } from './layout';
import { GY } from '../geometry';

const NR = (col: string) => rampH(ramp6(col));
const DR = (col: string) => rampH(ramp6(col), true);
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-bkr-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
const LETTERS: Look = { sx: 1, sy: 1, bold: true, fill: ['#FFFFFF', '#FFFFFF', '#FDE047', '#FDE047'], ink: INK };

/** A fat tire, stepped, its hub and a spoke turning. */
const wheel = (c: Ctx, x: number, y: number, r: number, f: number, hub = '#A1A1AA') => {
  const T = NR('#292524'), H = NR(hub);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = T[2]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = T[3]; c.beginPath(); c.arc(x - r * 0.12, y - r * 0.12, r * 0.82, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 8; k++) { const a = f + (k / 8) * Math.PI * 2; box(c, x + Math.cos(a) * r * 0.86 - 1, y + Math.sin(a) * r * 0.86 - 1, 2, 2, T[1]); }
  ballR(c, x, y, r * 0.5, H);
  c.strokeStyle = H[1]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + Math.cos(f) * r * 0.45, y + Math.sin(f) * r * 0.45); c.lineTo(x - Math.cos(f) * r * 0.45, y - Math.sin(f) * r * 0.45); c.stroke();
};
/** A headlight (its beam a soft wedge out in front while it's flashing). */
const headlight = (c: Ctx, x: number, y: number, r: number, on: boolean, dir: number) => {
  if (on) { const g = c.createLinearGradient(x, y, x + dir * 160, y); g.addColorStop(0, 'rgba(255,250,210,0.45)'); g.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + dir * 160, y - 34); c.lineTo(x + dir * 160, y + 26); c.closePath(); c.fill(); }
  const Ch = NR('#D4D4D8');
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 2.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = Ch[3]; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = on ? '#FFFDE7' : hour('#FDE68A'); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  if (!on) { c.fillStyle = hour('#E8C060'); c.beginPath(); c.arc(x + r * 0.3, y + r * 0.3, r * 0.5, 0, Math.PI * 2); c.fill(); }
  box(c, x - r * 0.5, y - r * 0.6, 2, 2, '#FFFFFF');
};

// ---------------------------------------------------------------------------------------------------------------
// COUCH DUDES' CRUISIN' COUCH

const L = COUCH_L, H = COUCH_H;
/** The couch's back and seat (behind the dudes): the chassis' skirt, the plaid back with its tufts, the cushions. */
const paintCouchBack = (g: Ctx) => {
  const Sf = NR('#C2410C'), Pl = NR('#7C2D12'), Ch = NR('#3F3F46'), Cu = NR('#EA580C');
  // (the go-kart chassis: a black skirt, rivets, the tailpipe out the back)
  box(g, -L / 2, -24, L, 16, INK); box(g, -L / 2 + 2, -22, L - 4, 12, Ch[3]); box(g, -L / 2 + 2, -22, L - 4, 2, Ch[5]); box(g, -L / 2 + 2, -13, L - 4, 3, Ch[1]);
  for (let x = -L / 2 + 8; x < L / 2 - 4; x += 14) box(g, x, -19, 2, 2, Ch[4]);
  box(g, -L / 2 - 8, -16, 12, 6, INK); box(g, -L / 2 - 7, -15, 10, 4, NR('#A1A1AA')[3]); box(g, -L / 2 - 7, -15, 10, 1, NR('#A1A1AA')[5]); g.fillStyle = INK; g.beginPath(); g.arc(-L / 2 - 7, -13, 2, 0, Math.PI * 2); g.fill();
  // (the back: a plaid sofa back, stepped across, tufted with buttons, the frame's top roll)
  const back = () => g.roundRect(-L / 2 + 9, -H + 3, L - 18, H - 24, 8);
  g.fillStyle = INK; g.beginPath(); g.roundRect(-L / 2 + 6, -H, L - 12, H - 18, 10); g.fill();
  shadeAcross(g, () => { g.beginPath(); back(); }, -L / 2 + 9, -H + 3, L - 18, H - 24, Sf);
  g.save(); g.beginPath(); back(); g.clip();
  for (let x = -L / 2; x < L / 2; x += 14) { box(g, x, -H, 4, H, Pl[3]); box(g, x, -H, 1, H, Pl[4]); }
  for (let y = -H + 2; y < 0; y += 12) { box(g, -L / 2, y, L, 3, Pl[3]); box(g, -L / 2, y, L, 1, Pl[4]); }
  for (let x = -L / 2 + 7; x < L / 2; x += 14) box(g, x, -H, 1, H, 'rgba(253,230,138,0.4)');
  box(g, -L / 2 + 9, -H + 3, L - 18, 4, Sf[4]); box(g, -L / 2 + 9, -H + 3, L - 18, 1, Sf[5]);
  for (let k = 0; k < 5; k++) { const bx = -L / 2 + 26 + k * 26; ballR(g, bx, -H + 18, 2.5, Sf); g.strokeStyle = Sf[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 6, -H + 14); g.lineTo(bx, -H + 18); g.lineTo(bx + 6, -H + 14); g.stroke(); }
  g.restore();
  // (the seat cushions, saggy, a split seam with the stuffing out on one)
  for (const cx of [-30, 26]) {
    g.fillStyle = INK; g.beginPath(); g.roundRect(cx - 27, -39, 54, 20, 7); g.fill();
    shadeAcross(g, () => { g.beginPath(); g.roundRect(cx - 25, -37, 50, 16, 6); }, cx - 25, -37, 50, 16, Cu);
    box(g, cx - 22, -37, 44, 2, Cu[5]); box(g, cx - 22, -24, 44, 2, Cu[1]);
    g.strokeStyle = Cu[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 20, -30); g.quadraticCurveTo(cx, -26, cx + 20, -30); g.stroke();
  }
  ballR(g, 38, -34, 3, NR('#FEF3C7')); ballR(g, 42, -35, 2.5, NR('#FEF3C7'));
};
/** The couch's front (over the dudes): the rolled arms, the fringe skirt, the chrome bumper, the props on the arms,
 *  the air horn, the duct-taped cup holders. */
const paintCouchFront = (g: Ctx) => {
  const Sf = NR('#C2410C'), Pl = NR('#7C2D12'), Ch = NR('#D4D4D8');
  // (the fringe along the skirt's top)
  for (let x = -L / 2 + 8; x < L / 2 - 8; x += 3) box(g, x, -22, 2, 5 + ((x * 7) & 3), Pl[2]);
  // (the arms: rolled, plaid, stepped)
  for (const ax of [-L / 2 + 4, L / 2 - 24]) {
    g.fillStyle = INK; g.beginPath(); g.roundRect(ax - 1, -52, 22, 36, 8); g.fill();
    shadeAcross(g, () => { g.beginPath(); g.roundRect(ax + 1, -50, 18, 32, 7); }, ax + 1, -50, 18, 32, Sf);
    g.save(); g.beginPath(); g.roundRect(ax + 1, -50, 18, 32, 7); g.clip(); for (let y = -48; y < -18; y += 10) box(g, ax, y, 22, 2, Pl[3]); box(g, ax + 9, -50, 2, 32, Pl[3]); g.restore();
    g.fillStyle = Sf[4]; g.beginPath(); g.ellipse(ax + 8, -48, 6, 2.5, 0, 0, Math.PI * 2); g.fill();
  }
  // (the chrome bumper on the front, its bolts)
  box(g, L / 2 - 8, -26, 14, 14, INK); box(g, L / 2 - 6, -24, 10, 10, Ch[3]); box(g, L / 2 - 6, -24, 10, 2, Ch[5]); box(g, L / 2 - 6, -16, 10, 2, Ch[1]);
  // (a bowl of cheese puffs on the front arm, a remote on the back one, the cup holders duct-taped on, a soda)
  g.fillStyle = INK; g.beginPath(); g.ellipse(L / 2 - 14, -52, 12, 6, 0, 0, Math.PI); g.fill(); g.fillStyle = NR('#F8FAFC')[3]; g.beginPath(); g.ellipse(L / 2 - 14, -52, 10, 4.5, 0, 0, Math.PI); g.fill();
  for (let i = 0; i < 5; i++) ballR(g, L / 2 - 22 + i * 4, -54 - (i % 2), 2.4, NR('#F59E0B'), false);
  box(g, -L / 2 + 6, -56, 14, 6, INK); box(g, -L / 2 + 7, -55, 12, 4, NR('#3F3F46')[3]); box(g, -L / 2 + 9, -54, 2, 1, '#DC2626'); box(g, -L / 2 + 13, -54, 1, 1, '#FDE047');
  box(g, -L / 2 + 2, -46, 10, 12, INK); box(g, -L / 2 + 3, -45, 8, 10, NR('#A1A1AA')[4]); box(g, -L / 2 + 2, -41, 10, 3, NR('#78716C')[3]);
  box(g, -L / 2 + 3, -54, 8, 9, INK); box(g, -L / 2 + 4, -53, 6, 8, NR('#DC2626')[3]); box(g, -L / 2 + 4, -53, 2, 8, NR('#DC2626')[4]); box(g, -L / 2 + 6, -60, 1, 7, NR('#F8FAFC')[3]);
  // (the air horn on the back arm: chrome, stepped)
  box(g, -L / 2 + 2, -64, 22, 8, INK); box(g, -L / 2 + 3, -63, 20, 6, Ch[3]); box(g, -L / 2 + 3, -63, 20, 2, Ch[5]); g.fillStyle = INK; g.beginPath(); g.moveTo(-L / 2 + 22, -66); g.lineTo(-L / 2 + 28, -68); g.lineTo(-L / 2 + 28, -52); g.lineTo(-L / 2 + 22, -54); g.closePath(); g.fill();
  g.fillStyle = Ch[2]; g.beginPath(); g.moveTo(-L / 2 + 22, -64); g.lineTo(-L / 2 + 27, -66); g.lineTo(-L / 2 + 27, -54); g.lineTo(-L / 2 + 22, -56); g.closePath(); g.fill();
};
/** One of the couch's animatronic slacker teens: `n` 0 the tall blond pompadour in the blue tee (braces), 1 the long-
 *  haired one in the black band tee; laughing (the jaw going, shoulders shaking) or not. */
const dude = (c: Ctx, x: number, y: number, n: number, laugh: boolean, f: number) => {
  const Sk = NR(n ? '#E8B48A' : '#F2C9A0'), Sh = NR(n ? '#1F2937' : '#2563EB'), Jn = NR('#3B5BA8');
  const shake = laugh && (f >> 2) % 2 ? -1 : 0, jaw = laugh && (f >> 3) % 2 ? 3 : 0;
  // (the legs over the cushion's front, sneakers)
  for (const lx of [-6, 3]) { box(c, x + lx - 1, y - 2, 7, 18, INK); box(c, x + lx, y - 1, 5, 16, Jn[3]); box(c, x + lx, y - 1, 1, 16, Jn[4]); box(c, x + lx - 2, y + 13, 9, 5, INK); box(c, x + lx - 1, y + 14, 7, 3, NR('#F8FAFC')[3]); }
  // (the torso: a tee, stepped, the band's skull on one)
  box(c, x - 10, y - 26 + shake, 20, 26, INK);
  shadeAcross(c, () => { c.beginPath(); c.rect(x - 9, y - 25 + shake, 18, 24); }, x - 9, y - 25 + shake, 18, 24, Sh);
  if (n) { ballR(c, x, y - 17 + shake, 4, NR('#E5E7EB'), false); box(c, x - 2, y - 18 + shake, 1, 1, INK); box(c, x + 1, y - 18 + shake, 1, 1, INK); box(c, x - 1, y - 14 + shake, 3, 1, INK); }
  else { box(c, x - 5, y - 20 + shake, 10, 2, NR('#F8FAFC')[4]); }
  // (the arms: one along the couch's back, one in the lap)
  box(c, x - 14, y - 24 + shake, 6, 6, INK); box(c, x - 13, y - 23 + shake, 4, 4, Sk[3]);
  box(c, x + 6, y - 12 + shake, 8, 5, INK); box(c, x + 7, y - 11 + shake, 6, 3, Sk[3]);
  // (the head: stepped, the ear, the eyes half-lidded, the mouth (laughing: the jaw going))
  const hy = y - 36 + shake;
  eggR(c, x, hy, 8.5, 9.5, Sk);
  eggR(c, x - 7, hy + 1, 2.5, 3.5, Sk);
  box(c, x + 1, hy - 3, 2, 2, INK); box(c, x + 5, hy - 3, 2, 2, INK); box(c, x + 1, hy - 4, 7, 1, Sk[1]);
  box(c, x + 1, hy + 4, 7, 2 + jaw, INK); if (!n && jaw) { box(c, x + 2, hy + 4, 5, 1, '#E5E7EB'); box(c, x + 3, hy + 4, 1, 1, '#A1A1AA'); }
  if (n) box(c, x + 2, hy + 4, 5, 1, '#E5E7EB');
  box(c, x + 7, hy, 3, 3, Sk[2]);
  // (the hair: a tall blond swoop, stepped; long and stringy brown)
  if (!n) { const Hr = NR('#FDE68A'); eggR(c, x - 1, hy - 16, 7.5, 10, Hr, true, -0.2); box(c, x - 4, hy - 22, 2, 8, Hr[5]); box(c, x + 3, hy - 14, 2, 6, Hr[2]); }
  else { const Hr = NR('#78350F'); box(c, x - 10, hy - 11, 20, 7, INK); box(c, x - 9, hy - 10, 18, 5, Hr[3]); box(c, x - 9, hy - 10, 18, 1, Hr[5]); box(c, x - 10, hy - 5, 5, 18, INK); box(c, x - 9, hy - 5, 3, 17, Hr[3]); box(c, x + 6, hy - 5, 4, 14, INK); box(c, x + 7, hy - 5, 2, 13, Hr[2]); for (let k = 0; k < 3; k++) box(c, x - 8 + k * 2, hy + 8 + k * 2, 1, 4, Hr[1]); }
};
const drawCouch = (c: Ctx, state: GameState, r: Ride) => {
  const f = state.frame, tell = r.phase === 'tell' || r.phase === 'turnTell';
  const flip = r.phase === 'turn' || r.phase === 'turnTell' ? Math.cos((r.t / 26) * Math.PI) : 1;
  const parked = r.phase === 'parked';
  c.save(); c.translate(Math.round(r.x), GY);
  if (tell) c.translate(f % 2 ? 1 : -1, 0);
  if (r.phase === 'brake') c.rotate(-r.dir * 0.04);
  c.scale(r.dir * (Math.abs(flip) < 0.15 ? 0.15 * Math.sign(flip || 1) : flip), 1);
  stamp(c, key('couch-back'), -L / 2 - 12, -H - 4, L + 24, H + 4, g => paintCouchBack(g));
  if (!parked) { dude(c, -26, -34, 0, tell || r.phase === 'charge', f); dude(c, 22, -34, 1, tell || r.phase === 'charge', f + 7); }
  stamp(c, key('couch-front'), -L / 2 - 4, -72, L + 14, 60, g => paintCouchFront(g));
  for (const wx of [-L / 2 + 22, -L / 2 + 50, L / 2 - 50, L / 2 - 22]) wheel(c, wx, -9, 9, parked ? 0 : r.x * 0.12, '#FDE047');
  // (the headlights on the front arm, the safety flag on its whip; the exhaust puffing as it revs)
  headlight(c, L / 2 - 4, -36, 5, !parked && tell && (f >> 2) % 2 === 0, 1);
  headlight(c, L / 2 - 4, -22, 4, !parked && tell && (f >> 2) % 2 === 1, 1);
  c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-L / 2 + 10, -22); c.quadraticCurveTo(-L / 2 + 4 - (r.v * 2), -80, -L / 2 + 2 - r.v * 3, -120); c.stroke();
  c.strokeStyle = hour('#E5E7EB'); c.lineWidth = 1; c.stroke();
  const fx = -L / 2 + 2 - r.v * 3, wav = Math.sin(f * 0.4) * 3, Fl = NR('#F97316');
  c.fillStyle = INK; c.beginPath(); c.moveTo(fx, -121); c.lineTo(fx - 23 + wav, -114); c.lineTo(fx, -105); c.closePath(); c.fill();
  c.fillStyle = Fl[3]; c.beginPath(); c.moveTo(fx, -119); c.lineTo(fx - 20 + wav, -114); c.lineTo(fx, -107); c.closePath(); c.fill();
  c.fillStyle = Fl[4]; c.beginPath(); c.moveTo(fx, -119); c.lineTo(fx - 10 + wav * 0.5, -116); c.lineTo(fx, -114); c.closePath(); c.fill();
  if (tell && f % 6 < 3 && !parked) { c.fillStyle = 'rgba(120,113,108,0.6)'; c.beginPath(); c.arc(-L / 2 - 14 - (f % 6) * 2, -14, 4 + (f % 6), 0, Math.PI * 2); c.fill(); }
  c.restore();
  // (parked dead: OUT OF ORDER on a sawhorse in front, a wisp of smoke)
  if (parked) {
    const sx = r.x + COUCH_L / 2 + 40;
    still2(c, 'outoforder', sx, GY, -46, -84, 92, 86, g => {
      const Or = NR('#F59E0B'), Wd = NR('#C8A97E'), Yl = NR('#FDE047');
      for (const [a2, b2] of [[-28, -20], [28, 20]] as const) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(a2, 0); g.lineTo(b2, -34); g.stroke(); g.strokeStyle = Wd[3]; g.lineWidth = 3; g.stroke(); }
      box(g, -34, -40, 68, 8, INK); box(g, -32, -39, 64, 6, Or[3]); box(g, -32, -39, 64, 1, Or[5]);
      for (let i = 0; i < 4; i++) box(g, -30 + i * 16, -39, 7, 6, INK);
      box(g, -2, -48, 4, 10, INK);
      box(g, -42, -80, 84, 34, INK); box(g, -40, -78, 80, 30, Yl[3]); box(g, -40, -78, 80, 2, Yl[5]); box(g, -40, -50, 80, 2, Yl[1]);
      signText(g, 'OUT OF', 0, -66, { sx: 1, sy: 1, bold: true, fill: INK });
      signText(g, 'ORDER', 0, -55, { sx: 1, sy: 1, bold: true, fill: '#B91C1C' });
    });
    if (f % 10 === 0) state.particles.push({ pos: { x: r.x, y: GY - 60 }, vel: { x: 0.3, y: -0.8 }, life: 50, color: '#78716C', size: 5 });
  }
};
/** Still art at world (x, y) for the hour (a stamp). */
const still2 = (c: Ctx, k: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, key(k), bx, by, bw, bh, paint); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// SPAZ & STINKY'S BUMPER BASH

const BUMP = [{ body: '#EC4899', name: 'SPAZ' }, { body: '#F59E0B', name: 'STINKY' }, { body: '#14B8A6', name: '#3' }];
const paintBumper = (g: Ctx, k: number) => {
  const B = NR(BUMP[k % BUMP.length].body), Rb = NR('#27272A'), Ch = NR('#D4D4D8'), Se = NR('#1F2937');
  // (the fat rubber ring, stepped)
  g.fillStyle = INK; g.beginPath(); g.roundRect(-CAR_L / 2 - 3, -23, CAR_L + 6, 20, 10); g.fill();
  g.fillStyle = Rb[2]; g.beginPath(); g.roundRect(-CAR_L / 2 - 1, -21, CAR_L + 2, 16, 8); g.fill();
  g.fillStyle = Rb[4]; g.beginPath(); g.roundRect(-CAR_L / 2 + 2, -20, CAR_L - 4, 4, 2); g.fill(); box(g, -CAR_L / 2 + 4, -10, CAR_L - 8, 3, Rb[1]);
  // (the tub: fiberglass, swooping up at the back; stepped across; a chrome trim along its lip)
  const tub = () => { g.moveTo(-CAR_L / 2 + 7, -19); g.quadraticCurveTo(-CAR_L / 2 + 3, -44, -CAR_L / 2 + 22, -45); g.lineTo(CAR_L / 2 - 8, -34); g.quadraticCurveTo(CAR_L / 2 - 1, -29, CAR_L / 2 - 4, -19); g.closePath(); };
  g.fillStyle = INK; g.beginPath(); g.moveTo(-CAR_L / 2 + 4, -18); g.quadraticCurveTo(-CAR_L / 2, -47, -CAR_L / 2 + 22, -48); g.lineTo(CAR_L / 2 - 6, -36); g.quadraticCurveTo(CAR_L / 2 + 2, -30, CAR_L / 2 - 2, -18); g.closePath(); g.fill();
  shadeAcross(g, () => { g.beginPath(); tub(); }, -CAR_L / 2 + 2, -46, CAR_L - 4, 28, B);
  g.save(); g.beginPath(); tub(); g.clip(); box(g, -CAR_L / 2, -24, CAR_L, 5, B[1]); checker(g, -CAR_L / 2, -26, CAR_L, 2, B[1], 0, 1); g.restore();
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-CAR_L / 2 + 20, -46); g.lineTo(CAR_L / 2 - 8, -35); g.stroke();
  g.strokeStyle = Ch[4]; g.lineWidth = 1.5; g.stroke();
  // (racing stripes, the seat (tufted vinyl), the steering column)
  box(g, -CAR_L / 2 + 10, -40, 34, 3, B[5]);
  box(g, -CAR_L / 2 + 13, -61, 24, 26, INK); box(g, -CAR_L / 2 + 15, -59, 20, 22, Se[3]); box(g, -CAR_L / 2 + 15, -59, 4, 22, Se[5]); box(g, -CAR_L / 2 + 31, -59, 4, 22, Se[1]);
  for (const sy of [-52, -44]) box(g, -CAR_L / 2 + 17, sy, 16, 1, Se[1]);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(CAR_L / 2 - 26, -36); g.lineTo(CAR_L / 2 - 20, -50); g.stroke(); g.strokeStyle = Ch[3]; g.lineWidth = 1; g.stroke();
  // (the face painted on its nose)
  if (k === 0) {
    // (SPAZ: a bug-eyed pink chihuahua, its ear up, its tongue out)
    ballR(g, CAR_L / 2 - 14, -30, 5, NR('#FFFFFF')); ballR(g, CAR_L / 2 - 13, -30, 2, NR('#B91C1C'), false);
    g.fillStyle = INK; g.beginPath(); g.moveTo(CAR_L / 2 - 24, -38); g.lineTo(CAR_L / 2 - 30, -52); g.lineTo(CAR_L / 2 - 18, -40); g.fill(); g.fillStyle = NR('#F9A8D4')[3]; g.beginPath(); g.moveTo(CAR_L / 2 - 24, -40); g.lineTo(CAR_L / 2 - 28, -48); g.lineTo(CAR_L / 2 - 20, -41); g.fill();
    box(g, CAR_L / 2 - 10, -24, 6, 2, INK); box(g, CAR_L / 2 - 8, -22, 3, 3, NR('#F472B6')[4]);
  } else if (k === 1) {
    // (STINKY: a fat dopey orange cat, eyes half shut, a stink line)
    for (const ex of [-16, -8]) { ballR(g, CAR_L / 2 + ex, -30, 4, NR('#FFFFFF')); box(g, CAR_L / 2 + ex - 3, -33, 7, 2, B[3]); box(g, CAR_L / 2 + ex - 1, -30, 2, 2, INK); }
    ballR(g, CAR_L / 2 - 6, -24, 2.5, NR('#F9A8D4'), false);
    g.strokeStyle = hour('#84CC16'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-CAR_L / 2 + 2, -50); g.bezierCurveTo(-CAR_L / 2 - 4, -56, -CAR_L / 2 + 6, -60, -CAR_L / 2, -66); g.stroke();
  } else { ballR(g, CAR_L / 2 - 14, -30, 7, NR('#FFFFFF')); signText(g, '3', CAR_L / 2 - 14, -26, { sx: 1, sy: 1, bold: true, fill: INK }); }
};
const drawBumper = (c: Ctx, state: GameState, r: Ride) => {
  const f = state.frame, B = BUMP[r.k % BUMP.length], tell = r.phase === 'tell';
  const sx = r.phase === 'spin' ? Math.cos(r.spin) : 1;
  // (its pole up to the ceiling grid on a spring at its foot; a spark at the top as it goes)
  const poleX = r.x - r.dir * 26 * sx, St = NR('#A1A1AA');
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(poleX, GY - 30); c.lineTo(poleX - r.dir * 6, Y(326)); c.stroke();
  c.strokeStyle = St[3]; c.lineWidth = 3; c.stroke(); c.strokeStyle = St[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(poleX - 1, GY - 30); c.lineTo(poleX - r.dir * 6 - 1, Y(326)); c.stroke();
  for (let k = 0; k < 4; k++) { box(c, poleX - 5, GY - 58 + k * 6, 10, 3, INK); box(c, poleX - 4, GY - 58 + k * 6, 8, 2, St[4]); }
  box(c, poleX - r.dir * 6 - 5, Y(326) - 4, 10, 6, INK); box(c, poleX - r.dir * 6 - 4, Y(326) - 3, 8, 4, hour('#B45309'));
  if (r.v > 1 && (f + r.k * 3) % 5 === 0) state.particles.push({ pos: { x: poleX - r.dir * 6, y: Y(326) }, vel: { x: (Math.random() - 0.5) * 3, y: Math.random() * 2 }, life: 10, color: '#FEF08A', size: 2 });
  // (its light on the pole: flashing red in the tell, a soft glow)
  const ly = GY - 92, lx = poleX - r.dir * 2;
  c.fillStyle = INK; c.beginPath(); c.arc(lx, ly, 7, 0, Math.PI * 2); c.fill();
  const on = tell && (f >> 2) % 2;
  c.fillStyle = on ? '#EF4444' : hour('#7F1D1D'); c.beginPath(); c.arc(lx, ly, 5, 0, Math.PI * 2); c.fill();
  box(c, lx - 2, ly - 3, 2, 2, on ? '#FFFFFF' : hour('#B91C1C'));
  if (on) { c.fillStyle = 'rgba(239,68,68,0.22)'; c.beginPath(); c.arc(lx, ly, 18, 0, Math.PI * 2); c.fill(); }
  c.save(); c.translate(Math.round(r.x), GY); c.scale(r.dir * (Math.abs(sx) < 0.12 ? 0.12 * Math.sign(sx || 1) : sx), 1);
  if (tell) c.translate(f % 2 ? 1 : -1, 0);
  stamp(c, key(`bumper-${r.k}`), -CAR_L / 2 - 6, -70, CAR_L + 12, 70, g => paintBumper(g, r.k));
  // (the wheel turning itself)
  c.save(); c.translate(CAR_L / 2 - 20, -52); c.rotate(Math.sin(f * 0.2 + r.k) * 0.8); c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.ellipse(0, 0, 3, 8, 0, 0, Math.PI * 2); c.stroke(); c.strokeStyle = hour('#3F3F46'); c.lineWidth = 1.5; c.stroke(); c.restore();
  headlight(c, CAR_L / 2 - 2, -14, 3.5, tell && (f >> 2) % 2 === 0, 1);
  c.restore();
  // (its name along its side, the right way round whichever way it's facing)
  if (Math.abs(sx) > 0.6) signText(c, B.name, r.x - r.dir * 8, GY - 24, B.name === '#3' ? LETTERS : { sx: 1, sy: 1, bold: false, fill: '#FFFFFF', ink: INK });
};

// ---------------------------------------------------------------------------------------------------------------
// GIGGLES THE CLOWN'S HURL-A-WHIRL

const CUPS = ['#A3E635', '#F472B6', '#38BDF8', '#FDE047'];
/** A barf-bucket car: a tapered bucket, stepped, its rim rolled, a sick face, the handle. */
const paintCup = (g: Ctx, k: number, dim: boolean) => {
  const R = dim ? DR(CUPS[k % 4]) : NR(CUPS[k % 4]), Rm = dim ? DR('#F5F5F4') : NR('#F5F5F4'), ink = dim ? dimmed(INK) : INK;
  const cup = () => { g.moveTo(-CUP_W / 2, -CUP_H); g.lineTo(CUP_W / 2, -CUP_H); g.lineTo(CUP_W / 2 - 9, 0); g.lineTo(-CUP_W / 2 + 9, 0); g.closePath(); };
  g.fillStyle = ink; g.beginPath(); g.moveTo(-CUP_W / 2 - 2, -CUP_H - 2); g.lineTo(CUP_W / 2 + 2, -CUP_H - 2); g.lineTo(CUP_W / 2 - 8, 2); g.lineTo(-CUP_W / 2 + 8, 2); g.closePath(); g.fill();
  shadeAcross(g, () => { g.beginPath(); cup(); }, -CUP_W / 2, -CUP_H, CUP_W, CUP_H, R);
  for (const ry of [-CUP_H + 12, -10]) box(g, -CUP_W / 2 + 4, ry, CUP_W - 8, 2, R[1]);
  // (the sick face: X'd eyes, a wavy green mouth, a drip)
  box(g, -10, -30, 5, 1.5, ink); box(g, -8, -32, 1.5, 5, ink); box(g, 5, -30, 5, 1.5, ink); box(g, 7, -32, 1.5, 5, ink);
  g.strokeStyle = dim ? dimmed('#166534') : hour('#166534'); g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -18); g.quadraticCurveTo(-5, -22, 0, -18); g.quadraticCurveTo(5, -14, 10, -18); g.stroke();
  box(g, 2, -17, 3, 5, dim ? dimmed('#84CC16') : hour('#84CC16')); box(g, 2, -12, 3, 2, dim ? dimmed('#BEF264') : hour('#BEF264'));
  // (the rolled rim, the handle)
  box(g, -CUP_W / 2 - 3, -CUP_H - 4, CUP_W + 6, 7, ink); box(g, -CUP_W / 2 - 1, -CUP_H - 3, CUP_W + 2, 4, Rm[3]); box(g, -CUP_W / 2 - 1, -CUP_H - 3, CUP_W + 2, 1, Rm[5]); box(g, -CUP_W / 2 - 1, -CUP_H, CUP_W + 2, 1, Rm[1]);
  g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath(); g.arc(0, -CUP_H - 2, CUP_W / 2 - 4, Math.PI, 0); g.stroke(); g.strokeStyle = Rm[2]; g.lineWidth = 1; g.stroke();
};
const cup = (c: Ctx, x: number, y: number, k: number, dim: boolean, f: number) => {
  c.save(); c.translate(x, y); c.rotate(Math.sin(f * 0.08 + k) * 0.12);
  stamp(c, key(`cup-${k}-${dim ? 1 : 0}`), -CUP_W / 2 - 4, -CUP_H - 6 - CUP_W / 2, CUP_W + 8, CUP_H + 10 + CUP_W / 2, g => paintCup(g, k, dim));
  c.restore();
};
/** Giggles' head (no eyes: they're live): purple tufts, the bald dome, bags, stubble, the painted grin round a sour
 *  mouth, the red nose, a cigarette, a tiny party hat. */
const paintGiggles = (g: Ctx) => {
  const Tf = NR('#9333EA'), Sk = NR('#FFF7ED'), Rd = NR('#DC2626'), Hat = NR('#FDE047');
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ballR(g, s * (28 + i * 4), -6 - i * 10, 10, Tf); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 32, 36, 0, 0, Math.PI * 2); g.fill();
  eggR(g, 0, 0, 29.5, 33.5, Sk, false);
  g.fillStyle = 'rgba(100,116,139,0.35)'; g.beginPath(); g.ellipse(0, 18, 22, 12, 0, 0, Math.PI); g.fill();
  checker(g, -18, 16, 36, 10, 'rgba(71,85,105,0.3)', 0, 1);
  for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.arc(s * 11, -8, 8.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(s * 11, -8, 7, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(71,85,105,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.arc(s * 11, -2, 6, 0.2, Math.PI - 0.2); g.stroke(); g.beginPath(); g.arc(s * 11, 0, 5, 0.4, Math.PI - 0.4); g.stroke(); }
  ballR(g, 0, 4, 7.5, Rd);
  g.strokeStyle = Rd[3]; g.lineWidth = 4; g.beginPath(); g.arc(0, 10, 18, 0.25, Math.PI - 0.25); g.stroke(); g.strokeStyle = Rd[4]; g.lineWidth = 1; g.beginPath(); g.arc(0, 9, 18, 0.3, 1.2); g.stroke();
  box(g, -7, 20, 14, 2, INK);
  box(g, 6, 19, 14, 3, '#F5F5F4'); box(g, 6, 21, 14, 1, '#D4D4D8'); box(g, 18, 19, 3, 3, '#F97316'); box(g, 19, 19, 1, 1, '#FDE047');
  g.fillStyle = INK; g.beginPath(); g.moveTo(-11, -31); g.lineTo(4, -61); g.lineTo(13, -29); g.closePath(); g.fill();
  g.fillStyle = Hat[3]; g.beginPath(); g.moveTo(-7, -33); g.lineTo(4, -56); g.lineTo(9, -32); g.closePath(); g.fill();
  g.fillStyle = Hat[5]; g.beginPath(); g.moveTo(-7, -33); g.lineTo(2, -52); g.lineTo(-1, -33); g.closePath(); g.fill();
  for (let k = 0; k < 3; k++) box(g, -3 + k * 3, -38 - k * 6, 2, 2, NR('#22D3EE')[3]);
  ballR(g, 4, -60, 3, NR('#F472B6'));
};
const giggles = (c: Ctx, x: number, y: number, tell: boolean, f: number) => {
  c.save(); c.translate(x, y);
  if (tell) c.rotate(Math.sin(f * 0.8) * 0.12);
  stamp(c, key('giggles'), -46, -66, 92, 106, g => paintGiggles(g));
  const skin = hour('#FFF7ED');
  for (const s of [-1, 1]) {
    if (tell) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); for (let a = 0; a < 9; a += 0.4) { const rr = a * 0.65; c.lineTo(s * 11 + Math.cos(a + f * 0.4 * s) * rr, -8 + Math.sin(a + f * 0.4 * s) * rr); } c.stroke(); }
    else { box(c, s * 11 - 6, -14, 12, 5, skin); box(c, s * 11 - 6, -9, 12, 1.5, INK); box(c, s * 11 - 1, -7, 3, 3, INK); }
  }
  c.fillStyle = 'rgba(200,200,210,0.6)'; c.beginPath(); c.arc(22 + Math.sin(f * 0.05) * 2, 12 - (f % 40) * 0.3, 2 + (f % 40) * 0.06, 0, Math.PI * 2); c.fill();
  c.restore();
};
const paintWhirlBase = (g: Ctx) => {
  const Or = NR('#F97316'), Pu = NR('#9333EA');
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -14, WHIRL.r + 30, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Or[2]; g.beginPath(); g.ellipse(0, -14, WHIRL.r + 27, 15, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Or[3]; g.beginPath(); g.ellipse(-4, -17, WHIRL.r + 20, 10, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Or[4]; g.beginPath(); g.ellipse(-40, -21, WHIRL.r - 40, 4, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, -14, WHIRL.r + 27, 15, 0, 0, Math.PI); g.clip();
  for (let x = -WHIRL.r - 30; x < WHIRL.r + 30; x += 16) { box(g, x, -14, 8, 16, Pu[3]); box(g, x, -14, 2, 16, Pu[4]); }
  box(g, -WHIRL.r - 30, -4, WHIRL.r * 2 + 60, 4, 'rgba(26,16,40,0.35)');
  g.restore();
  // (the column: a fat barber pole up to the head, stepped across)
  const top = Y(250) - GY;
  box(g, -22, top + 20, 44, -30 - top - 20, INK);
  for (let y = top + 22; y < -30; y += 18) { const W2 = NR('#FFFFFF'); box(g, -20, y, 40, 9, W2[3]); box(g, -20, y + 9, 40, 9, Pu[3]); }
  box(g, -20, top + 22, 8, -52 - top, 'rgba(255,255,255,0.3)'); box(g, 8, top + 22, 12, -52 - top, 'rgba(26,16,40,0.25)'); checker(g, 6, top + 22, 2, -52 - top, 'rgba(26,16,40,0.25)', 0, 1);
  box(g, -26, top + 18, 52, 6, INK); box(g, -24, top + 19, 48, 4, NR('#FDE047')[3]);
};
const drawWhirlBack = (c: Ctx, state: GameState, r: Ride) => {
  const f = state.frame, tell = r.phase === 'tell';
  const bx = r.x + (tell ? (f % 2 ? 1.5 : -1.5) : 0), top = Y(250);
  c.save(); c.translate(Math.round(bx), GY);
  stamp(c, key('whirl-base'), -WHIRL.r - 34, top - GY + 14, WHIRL.r * 2 + 68, GY - top + 22, g => paintWhirlBase(g));
  c.restore();
  for (let i = 0; i < 16; i++) { const lx = bx - WHIRL.r + i * (WHIRL.r * 2 / 15), on = (f >> 3) % 2 === i % 2; c.fillStyle = INK; c.beginPath(); c.arc(lx, GY - 8, 3.5, 0, Math.PI * 2); c.fill(); c.fillStyle = on ? '#FEF08A' : hour('#7E22CE'); c.beginPath(); c.arc(lx, GY - 8, 2.5, 0, Math.PI * 2); c.fill(); if (on) box(c, lx - 1, GY - 10, 1, 1, '#FFFFFF'); }
  for (const cx of [-WHIRL.r + 10, -WHIRL.r / 2, WHIRL.r / 2, WHIRL.r - 10]) wheel(c, bx + cx, GY - 4, 6, r.x * 0.1);
  // (the back cars, dim, on their arms; the front cars' arms too (behind him: only the cars swing out to the front))
  for (const car of whirlCars(r)) if (!car.front) {
    c.strokeStyle = dimmed(INK); c.lineWidth = 7; c.beginPath(); c.moveTo(bx, top + 60); c.lineTo(car.x, Y(car.h + CUP_H + 4)); c.stroke();
    c.strokeStyle = dimmed('#A1A1AA'); c.lineWidth = 4; c.stroke();
    cup(c, car.x, Y(car.h), car.k, true, f);
  }
  for (const car of whirlCars(r)) if (car.front) {
    c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(bx, top + 60); c.lineTo(car.x, Y(car.h + CUP_H + 4)); c.stroke();
    c.strokeStyle = hour('#A1A1AA'); c.lineWidth = 5; c.stroke(); c.strokeStyle = hour('#E5E7EB'); c.lineWidth = 1.5; c.stroke();
  }
  ballR(c, bx, top + 60, 9, NR('#D4D4D8'));
  giggles(c, bx, top, tell, f);
};
const drawWhirlFront = (c: Ctx, state: GameState, r: Ride) => {
  const f = state.frame;
  for (const car of whirlCars(r).filter(c2 => c2.front).sort((a, b) => a.depth - b.depth)) cup(c, car.x, Y(car.h), car.k, false, f);
};

// ---------------------------------------------------------------------------------------------------------------
// DETECTIVE DRAKE'S MOTION MADNESS

/** The pod's egg (facing +1: the window to the right): white banded in steps, a teal stripe and an orange one, the
 *  tinted window, Detective Drake painted on its side, rivets round its seam. */
const paintPod = (g: Ctx, dir: number) => {
  const Wh = NR('#F8FAFC'), Te = NR('#0E7490'), Or = NR('#F97316');
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, POD_W / 2 + 2, 36, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, 0, POD_W / 2, 34, 0, 0, Math.PI * 2); g.clip();
  for (let i = 0; i < 6; i++) box(g, -POD_W / 2, -34 + i * 12, POD_W, 13, Wh[[5, 4, 4, 3, 3, 2][i]]);
  box(g, POD_W * 0.22, -40, POD_W, 80, Wh[2]); checker(g, POD_W * 0.22 - 2, -40, 2, 80, Wh[2], 0, 1); box(g, POD_W * 0.36, -40, POD_W, 80, Wh[1]);
  box(g, -POD_W / 2, 8, POD_W, 9, Te[3]); box(g, -POD_W / 2, 8, POD_W, 2, Te[4]); box(g, -POD_W / 2, 15, POD_W, 2, Te[1]);
  box(g, -POD_W / 2, 18, POD_W, 3, Or[3]);
  box(g, -POD_W / 2, 22, POD_W, 14, Wh[1]);
  g.restore();
  for (let k = 0; k < 9; k++) { const a = Math.PI * (0.1 + k * 0.1); box(g, Math.cos(a) * (POD_W / 2 - 4) - 1, -Math.sin(a) * 30 + 6, 2, 2, Wh[1]); }
  // (the tinted window, its glint)
  const wx = dir * 22;
  g.fillStyle = INK; g.beginPath(); g.ellipse(wx, -10, 20, 12, 0, 0, Math.PI * 2); g.fill();
  const Gl = NR('#1E293B');
  g.fillStyle = Gl[3]; g.beginPath(); g.ellipse(wx, -10, 18, 10, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = Gl[4]; g.beginPath(); g.ellipse(wx - 4, -13, 12, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, wx - 10, -16, 8, 2, 'rgba(255,255,255,0.5)'); box(g, wx - 12, -13, 3, 2, 'rgba(255,255,255,0.4)');
  // (Detective Drake: a green duck in a fedora and a trench coat, magnifying glass up)
  const dx = -dir * 22, dy = -4, Gd = NR('#22C55E'), Bk = NR('#F59E0B'), Ht = NR('#78716C'), Tr = NR('#A16207');
  box(g, dx - 9, dy + 8, 18, 12, INK); box(g, dx - 8, dy + 9, 16, 10, Tr[3]); box(g, dx - 8, dy + 9, 3, 10, Tr[4]); box(g, dx - 1, dy + 9, 2, 10, Tr[1]);
  ballR(g, dx, dy, 8.5, Gd);
  eggR(g, dx + dir * 9, dy + 3, 7, 3, Bk);
  box(g, dx + dir * 3 - 1, dy - 4, 3, 3, INK); box(g, dx + dir * 3 - 1, dy - 4, 1, 1, '#FFFFFF');
  box(g, dx - 11, dy - 13, 22, 4, INK); box(g, dx - 10, dy - 12, 20, 2, Ht[3]); box(g, dx - 7, dy - 20, 14, 8, INK); box(g, dx - 6, dy - 19, 12, 6, Ht[3]); box(g, dx - 6, dy - 19, 3, 6, Ht[4]); box(g, dx - 6, dy - 15, 12, 2, NR('#1F2937')[3]);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(dx - dir * 14, dy - 2, 5, 0, Math.PI * 2); g.moveTo(dx - dir * 10, dy + 2); g.lineTo(dx - dir * 6, dy + 8); g.stroke();
  g.fillStyle = 'rgba(200,230,255,0.45)'; g.beginPath(); g.arc(dx - dir * 14, dy - 2, 4, 0, Math.PI * 2); g.fill();
};
const drawPod = (c: Ctx, state: GameState, r: Ride) => {
  const f = state.frame, tell = r.phase === 'tell', air = r.phase === 'air', land = r.phase === 'land';
  const crouch = tell ? Math.min(1, r.t / 20) : land ? Math.max(0, 1 - r.t / 20) : 0;
  const legH = air ? 40 : 34 - crouch * 18, bodyY = Y(r.y + legH);
  if (r.y > 2) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(r.x, GY - 2, POD_W / 2 * Math.max(0.4, 1 - r.y / 300), 6, 0, 0, Math.PI * 2); c.fill(); }
  c.save(); c.translate(Math.round(r.x), 0);
  if (tell) c.translate(f % 2 ? 1 : -1, 0);
  // (the legs: chrome pistons, bent at the knee, out and down to fat feet; the far pair dimmer)
  const Ch = NR('#E5E7EB'), Ft = NR('#52525B');
  for (const k of [0.35, 0.7]) for (const s of [-1, 1]) {
    const hx = s * POD_W * 0.3 * k + s * 10, fx = s * POD_W * 0.48 * (0.6 + k * 0.5), fy = Y(r.y), kx = (hx + fx) / 2 + s * 12, ky = bodyY + (fy - bodyY) * 0.4, near = k > 0.5;
    c.strokeStyle = INK; c.lineWidth = near ? 9 : 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, bodyY - 4); c.lineTo(kx, ky); c.lineTo(fx, fy - 4); c.stroke();
    c.strokeStyle = near ? Ch[2] : dimmed('#B8B8C8'); c.lineWidth = near ? 5 : 4; c.stroke();
    if (near) { c.strokeStyle = Ch[5]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx - 1, bodyY - 5); c.lineTo(kx - 1, ky - 1); c.stroke(); c.strokeStyle = NR('#F59E0B')[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(kx, ky); c.lineTo(kx + (fx - kx) * 0.4, ky + (fy - ky) * 0.4); c.stroke(); }
    ballR(c, kx, ky, near ? 4 : 3, near ? Ch : DR('#B8B8C8'));
    box(c, fx - 10, fy - 7, 20, 7, INK); box(c, fx - 9, fy - 6, 18, 5, Ft[3]); box(c, fx - 9, fy - 6, 18, 1, Ft[5]);
  }
  // (the egg, stamped; the beacon on top: amber, turning; flashing hard in the tell)
  const ey = bodyY - 32;
  c.save(); c.translate(0, ey); stamp(c, key(`pod-${r.dir}`), -POD_W / 2 - 4, -40, POD_W + 8, 80, g => paintPod(g, r.dir)); c.restore();
  const on = tell ? (f >> 2) % 2 === 0 : (f >> 4) % 2 === 0;
  box(c, -8, ey - 45, 16, 12, INK); box(c, -9, ey - 35, 18, 3, INK);
  c.fillStyle = on ? '#FBBF24' : hour('#92400E'); c.fillRect(-6, ey - 43, 12, 8);
  box(c, on ? -5 + ((f >> 1) % 8) : -4, ey - 42, 3, 6, on ? '#FFF7D6' : hour('#B45309'));
  if (on && (tell || r.phase === 'air')) { c.fillStyle = 'rgba(251,191,36,0.28)'; c.beginPath(); c.arc(0, ey - 38, 26, 0, Math.PI * 2); c.fill(); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// RAD RAT'S TUBULAR HALFPIPE: the board

const paintBoard = (g: Ctx) => {
  const Pu = NR('#7C3AED'), Tk = NR('#A1A1AA'), Se = NR('#1F2937'), Yl = NR('#FDE047');
  for (const wx of [-BOARD_L / 2 + 20, BOARD_L / 2 - 20]) { box(g, wx - 11, -19, 22, 7, INK); box(g, wx - 10, -18, 20, 5, Tk[3]); box(g, wx - 10, -18, 20, 1, Tk[5]); box(g, wx - 3, -24, 6, 6, INK); box(g, wx - 2, -23, 4, 5, Tk[2]); }
  // (the deck: kicked up at both ends, stepped, flames along it)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-BOARD_L / 2 - 6, -31); g.quadraticCurveTo(-BOARD_L / 2 - 16, -36, -BOARD_L / 2 - 10, -23); g.lineTo(BOARD_L / 2 + 10, -23); g.quadraticCurveTo(BOARD_L / 2 + 16, -36, BOARD_L / 2 + 6, -31); g.closePath(); g.fill();
  box(g, -BOARD_L / 2 - 4, -30, BOARD_L + 8, 6, Pu[3]); box(g, -BOARD_L / 2 - 4, -30, BOARD_L + 8, 2, Pu[4]); box(g, -BOARD_L / 2 - 4, -25, BOARD_L + 8, 1, Pu[1]);
  box(g, -BOARD_L / 2 - 4, -32, BOARD_L + 8, 2, NR('#1F2937')[2]); checker(g, -BOARD_L / 2 - 4, -32, BOARD_L + 8, 2, NR('#3F3F46')[3], 0, 1);
  for (let i = 0; i < 6; i++) { const fx = -BOARD_L / 2 + 6 + i * 12, col = i % 2 ? NR('#F97316') : Yl; g.fillStyle = INK; g.beginPath(); g.moveTo(fx, -24); g.lineTo(fx + 7, -34); g.lineTo(fx + 14, -24); g.fill(); g.fillStyle = col[3]; g.beginPath(); g.moveTo(fx + 1, -24); g.lineTo(fx + 7, -32); g.lineTo(fx + 13, -24); g.fill(); g.fillStyle = col[5]; g.beginPath(); g.moveTo(fx + 3, -24); g.lineTo(fx + 7, -29); g.lineTo(fx + 7, -24); g.fill(); }
  signText(g, 'RAD RAT', BOARD_L / 4, -24, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF', ink: INK });
  // (the seats, the lap bars down, the hand grips; empty)
  for (let i = 0; i < 4; i++) {
    const sx = -BOARD_L / 2 + 16 + i * 30;
    box(g, sx - 10, -51, 20, 23, INK); box(g, sx - 8, -49, 16, 19, Se[3]); box(g, sx - 8, -49, 3, 19, Se[5]); box(g, sx + 5, -49, 3, 19, Se[1]); box(g, sx - 6, -41, 12, 1, Se[1]);
    g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(sx - 9, -38); g.quadraticCurveTo(sx, -46, sx + 12, -38); g.stroke();
    g.strokeStyle = Yl[3]; g.lineWidth = 2; g.stroke(); g.strokeStyle = Yl[5]; g.lineWidth = 0.8; g.stroke();
  }
};
const drawBoard = (c: Ctx, state: GameState) => {
  const f = state.frame, b = boardAt(f);
  c.save(); c.translate(b.x, b.y); c.rotate(b.a);
  stamp(c, key('board'), -BOARD_L / 2 - 18, -56, BOARD_L + 36, 46, g => paintBoard(g));
  for (const wx of [-BOARD_L / 2 + 20, BOARD_L / 2 - 20]) { wheel(c, wx - 6, -8, 8, b.x * 0.2, '#FDE047'); wheel(c, wx + 6, -8, 8, b.x * 0.2, '#FDE047'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind him: the couch, the bumper cars, the whirl's base, column, head and back cars, the pod, the board. */
export const drawRidesBack = (c: Ctx, state: GameState) => {
  const k = bigkidOf(state);
  if (onScreen(state, k.couch.x - 200, k.couch.x + 200)) drawCouch(c, state, k.couch);
  if (onScreen(state, X(RINK.a) - 100, X(RINK.b) + 100)) for (const r of k.bumpers) drawBumper(c, state, r);
  if (onScreen(state, k.whirl.x - WHIRL.r - 120, k.whirl.x + WHIRL.r + 120)) drawWhirlBack(c, state, k.whirl);
  if (onScreen(state, k.pod.x - 120, k.pod.x + 120)) drawPod(c, state, k.pod);
  if (onScreen(state, X(PIPE.a) - 100, X(PIPE.b) + 100)) drawBoard(c, state);
};

/** In front: the whirl's front cars, the glop pits' near lip, what's thrown and left lying. */
export const drawRidesFront = (c: Ctx, state: GameState) => {
  const k = bigkidOf(state), f = state.frame;
  if (onScreen(state, k.whirl.x - WHIRL.r - 120, k.whirl.x + WHIRL.r + 120)) drawWhirlFront(c, state, k.whirl);
  // The glop pits: the near lip of the slime, bulging, banded, bubbles popping, junk bobbing in it
  const G = NR('#65D11B');
  for (const [a, b] of PITS) {
    if (!onScreen(state, X(a), X(b))) continue;
    const l = Math.max(X(a), state.camera.x - 20), r = Math.min(X(b), state.camera.x + 820);
    const top = (x: number) => GY + 9 + Math.sin(x * 0.05 + f * 0.05) * 3;
    c.fillStyle = INK; c.beginPath(); c.moveTo(l, GY + 34);
    for (let x = l; x <= r; x += 8) c.lineTo(x, top(x) - 2);
    c.lineTo(r, GY + 34); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.moveTo(l, GY + 34); for (let x = l; x <= r; x += 8) c.lineTo(x, top(x)); c.lineTo(r, GY + 34); c.closePath(); c.clip();
    box(c, l, GY + 4, r - l, 30, G[2]); box(c, l, GY + 16, r - l, 18, G[1]); checker(c, l, GY + 14, r - l, 2, G[1], 0, 1);
    c.restore();
    c.strokeStyle = G[4]; c.lineWidth = 2; c.beginPath(); for (let x = l; x <= r; x += 8) { if (x === l) c.moveTo(x, top(x) + 1); else c.lineTo(x, top(x) + 1); } c.stroke();
    c.fillStyle = 'rgba(236,252,203,0.75)'; for (let x = Math.floor(l / 60) * 60; x < r; x += 60) c.fillRect(x + 10, top(x + 10) + 2, 14, 2);
    for (let x = Math.floor(l / 70) * 70; x < r; x += 70) { const t = (f + x * 7) % 90; if (t < 30) { c.strokeStyle = '#D9F99D'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 20, top(x + 20) - t * 0.15, 3 + t * 0.15, Math.PI, 0); c.stroke(); } }
    // (junk bobbing in it: a soda cup and its lid, a sneaker, a foam finger)
    for (const [jx, kind] of [[X(a) + 180, 0], [X(a) + 520, 1], [X(a) + 760, 2]] as [number, number][]) {
      if (jx < l || jx > r) continue;
      const jy = top(jx) - 2 + Math.sin(f * 0.06 + jx) * 1.5;
      if (kind === 0) { box(c, jx - 6, jy - 6, 12, 8, INK); box(c, jx - 5, jy - 5, 10, 6, hour('#DC2626')); box(c, jx - 5, jy - 5, 10, 2, hour('#F8FAFC')); box(c, jx + 1, jy - 12, 2, 7, hour('#F472B6')); }
      else if (kind === 1) { box(c, jx - 10, jy - 5, 20, 7, INK); box(c, jx - 9, jy - 4, 18, 5, hour('#F8FAFC')); box(c, jx - 9, jy - 1, 18, 2, hour('#A1A1AA')); box(c, jx - 4, jy - 4, 8, 2, hour('#2563EB')); }
      else { c.save(); c.translate(jx, jy); c.rotate(-0.6); box(c, -4, -14, 9, 16, INK); box(c, -3, -13, 7, 14, hour('#FDE047')); box(c, -1, -20, 4, 8, INK); box(c, 0, -19, 2, 7, hour('#FDE047')); c.restore(); }
    }
  }
  // What's thrown and left lying
  for (const s of k.throws) {
    if (s.kind === 'cone') {
      const Co = NR('#F97316');
      c.save(); c.translate(s.x, s.y); if (!s.down) c.rotate(s.t * 0.3);
      c.fillStyle = INK; c.beginPath(); c.moveTo(-10, 2); c.lineTo(10, 2); c.lineTo(3, -21); c.lineTo(-3, -21); c.closePath(); c.fill();
      c.fillStyle = Co[3]; c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.lineTo(2, -19); c.lineTo(-2, -19); c.closePath(); c.fill();
      c.fillStyle = Co[4]; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-3, 0); c.lineTo(-1, -19); c.lineTo(-2, -19); c.closePath(); c.fill();
      c.fillStyle = Co[1]; c.beginPath(); c.moveTo(4, 0); c.lineTo(8, 0); c.lineTo(2, -19); c.closePath(); c.fill();
      box(c, -5, -12, 10, 3, '#FFFFFF'); box(c, -4, -6, 8, 2, '#F4F4F5');
      box(c, -12, 0, 24, 4, INK); box(c, -11, 0, 22, 2, Co[2]);
      c.restore();
    } else if (s.kind === 'board') {
      c.save(); c.translate(s.x, s.y);
      for (const wx of [-14, 14]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, -4, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = hour('#FDE047'); c.beginPath(); c.arc(wx, -4, 3.5, 0, Math.PI * 2); c.fill(); box(c, wx - 1, -6, 1, 1, '#FFFFFF'); }
      box(c, -16, -9, 32, 3, INK); box(c, -15, -8, 30, 1, hour('#A1A1AA'));
      c.fillStyle = INK; c.beginPath(); c.roundRect(-25, -14, 50, 6, 3); c.fill();
      const Pu = NR('#7C3AED'); box(c, -23, -13, 46, 4, Pu[3]); box(c, -23, -13, 46, 1, Pu[4]); box(c, -6, -13, 12, 3, hour('#FDE047'));
      c.restore();
    } else if (s.kind === 'glop') {
      const Gl = NR('#84CC16');
      c.fillStyle = Gl[2]; c.beginPath(); c.arc(s.x - s.vx * 1.5, s.y - s.vy * 1.5, 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = Gl[1]; c.beginPath(); c.arc(s.x - s.vx * 2.6, s.y - s.vy * 2.6, 2.5, 0, Math.PI * 2); c.fill();
      ballR(c, s.x, s.y, 7, Gl);
    } else if (s.kind === 'puddle') {
      const a = Math.max(0, 1 - Math.max(0, s.t - 290) / 40), Gl = NR('#84CC16');
      c.globalAlpha = a;
      c.fillStyle = INK; c.beginPath(); c.ellipse(s.x, s.y - 1, 38, 6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = Gl[2]; c.beginPath(); c.ellipse(s.x, s.y - 1, 36, 4.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = Gl[3]; c.beginPath(); c.ellipse(s.x - 4, s.y - 2, 28, 3, 0, 0, Math.PI * 2); c.fill();
      box(c, s.x - 20, s.y - 4, 10, 2, Gl[5]); box(c, s.x + 6, s.y - 3, 5, 1, Gl[4]);
      if ((f + Math.round(s.x)) % 50 < 12) { c.strokeStyle = '#ECFCCB'; c.lineWidth = 1; c.beginPath(); c.arc(s.x + 12, s.y - 4, 3 + ((f + Math.round(s.x)) % 50) * 0.2, Math.PI, 0); c.stroke(); }
      c.globalAlpha = 1;
    } else if (s.kind === 'churro') {
      const Ch = NR('#C2853F');
      c.save(); c.translate(s.x, s.y); c.rotate(Math.atan2(s.vy, s.vx));
      c.fillStyle = INK; c.beginPath(); c.roundRect(-16, -4.5, 32, 9, 4); c.fill();
      c.fillStyle = Ch[3]; c.beginPath(); c.roundRect(-15, -3.5, 30, 7, 3); c.fill();
      box(c, -14, -3, 28, 2, Ch[4]); box(c, -14, 1, 28, 2, Ch[1]);
      c.strokeStyle = Ch[0]; c.lineWidth = 1; for (let x = -12; x < 14; x += 4) { c.beginPath(); c.moveTo(x, -3); c.lineTo(x + 2, 3); c.stroke(); }
      c.fillStyle = '#FFF7ED'; for (let i = 0; i < 7; i++) c.fillRect(-13 + i * 4.3, -3 + (i % 2) * 4, 1, 1);
      c.restore();
    }
  }
};
