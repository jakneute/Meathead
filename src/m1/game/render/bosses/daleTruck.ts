// Drug Trade Dale's delivery truck and its incoming-truck warning (world space).

import { Enemy } from '../../../types';
import { BOSS_DOOR_X, ARENA_LEFT, DALE_TRUCK_SPEED } from '../../../constants';
import { bandedGradient, pixelBlob, checker } from '../pixelArt';
import { INK, dark, lite, ink } from '../npc/kit';
import { drawFire } from '../fx/fire';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------
// The kit (Dale's stage draws with these too): the 16-bit way, an ink line round each thing, its colour in steps
// (lit from the upper left, shadowed lower right), no smooth gradients.
// ---------------------------------------------------------------------------

/** A block: its colour, lit along the top and down the left, shadowed down the right and along the bottom, inked round. */
export const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** A block in three steps across (a post, a stack, a barrel): lit left third, its colour, the shadow right. */
export const column = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.25); ctx.fillRect(x, y, Math.max(1, Math.round(w * 0.3)), h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - Math.max(1, Math.round(w * 0.28)), y, Math.max(1, Math.round(w * 0.28)), h);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** A run along (a rail, a beam, a pipe): lit along its top, its shadow along the bottom, inked top and bottom. */
export const pipe = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y + 1, w, Math.max(1, Math.round(h * 0.25)));
  ctx.fillStyle = lite(c, 0.55); ctx.fillRect(x, y + 1, w, 1);
  ctx.fillStyle = dark(c, 0.3); ctx.fillRect(x, y + h - Math.max(1, Math.round(h * 0.3)), w, Math.max(1, Math.round(h * 0.3)));
  ctx.fillStyle = INK; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
};

/** Lettering, centered on x, a drop shadow under it in the sign's own dark. */
export const letter = (ctx: Ctx, text: string, x: number, y: number, font: string, c: string, shadow: string, maxW?: number) => {
  ctx.font = font; ctx.textAlign = 'center';
  ctx.fillStyle = shadow; if (maxW) ctx.fillText(text, x + 1, y + 1, maxW); else ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = c; if (maxW) ctx.fillText(text, x, y, maxW); else ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
};

/** Diagonal hazard stripes, yellow and black, across (x, y, w, h), inked top and bottom. */
export const hazard = (ctx: Ctx, x: number, y: number, w: number, h: number, step = 6) => {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#1C1917';
  for (let sx = Math.floor((x - h) / (step * 2)) * step * 2; sx < x + w; sx += step * 2) { ctx.beginPath(); ctx.moveTo(sx, y + h); ctx.lineTo(sx + h, y); ctx.lineTo(sx + h + step, y); ctx.lineTo(sx + step, y + h); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + h - 1, w, 1);
  ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + h - 1, w, 1);
};

// ---------------------------------------------------------------------------
// The truck
// ---------------------------------------------------------------------------

const TRUCK_Y = 400;
const TRUCK_W = 350;
const TRUCK_H = 150;
const TRAILER_W = 252;
const WHEEL_R = 22;

/**
 * How far round a wheel of radius r is, having rolled dist at speed (px a frame; + is to the right, which is clockwise
 * on screen). Five spokes: turned more than half a spoke a frame, the eye reads them going backwards (the wagon-wheel
 * thing), so a fast wheel is shown turning the right way at a steady WHEEL_MAX_TURN a frame instead.
 */
const WHEEL_MAX_TURN = 0.4;
export const wheelTurn = (dist: number, speed: number, r: number, frame: number) =>
  Math.abs(speed) / r <= WHEEL_MAX_TURN ? dist / r : frame * WHEEL_MAX_TURN * Math.sign(speed);

export const drawDaleTruck = (ctx: Ctx, e: Enemy, frame: number) => {
  if (!e.truckActive || e.truckX === undefined) return;
  ctx.save();
  // Not affected by Dale's own hit-flicker or drug filters
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  if (e.truckX < BOSS_DOOR_X) drawIncomingWarning(ctx, frame);
  if ((e.truckRev ?? 0) > 0) drawRevving(ctx, e.truckRev!, frame);
  drawDeliveryTruck(ctx, e.truckX, TRUCK_Y, frame, !!e.truckCrashing, true, DALE_TRUCK_SPEED);
  drawRoofFire(ctx, e.truckX, TRUCK_Y, frame, !!e.truckCrashing);
  ctx.restore();
};

/**
 * Revving out back before it comes (`left`: frames of it to go): its high beams flashing in through the shop's
 * front doors at shin height, a glare at the doorway, in three stepped bands, on and off, faster as it gets close.
 */
const drawRevving = (ctx: Ctx, left: number, frame: number) => {
  const period = left > 14 ? 8 : 4;
  if (frame % period >= period / 2 + 1) return;
  const x = ARENA_LEFT, y0 = TRUCK_Y + 72, y1 = TRUCK_Y + 82;
  headBeam(ctx, x, y0, y1, 300, 40, 1, 0.55);
  // (the glare, where it's coming in)
  pixelBlob(ctx, x + 4, (y0 + y1) / 2, 26, 18, 'rgba(255, 244, 180, 0.35)');
  pixelBlob(ctx, x + 2, (y0 + y1) / 2, 12, 9, 'rgba(255, 255, 255, 0.7)');
};

/**
 * Dale's truck's roof, on fire (so nobody takes it for somewhere to stand): the trailer roof charred black along its
 * rail, dithered off into the white, and fires all down it and on the cab roof, blown back by the speed it's going.
 */
const ROOF_FIRES: { dx: number; dy: number; w: number; h: number }[] = [
  { dx: 30, dy: 3, w: 50, h: 30 }, { dx: 92, dy: 3, w: 56, h: 38 }, { dx: 158, dy: 3, w: 50, h: 30 }, { dx: 220, dy: 3, w: 48, h: 34 },
  { dx: TRAILER_W + 30, dy: 31, w: 40, h: 26 },
];
const drawRoofFire = (ctx: Ctx, x: number, y: number, frame: number, crashing: boolean) => {
  const bounce = crashing ? Math.sin(frame * 1.7) * 3 + 4 : Math.sin(frame * 0.9) * 1.2;
  const by = Math.round(y + bounce);
  // (the char along the top of the box, and up the cab roof)
  ctx.fillStyle = 'rgba(28, 25, 23, 0.7)'; ctx.fillRect(x + 2, by + 4, TRAILER_W - 4, 5);
  checker(ctx, x + 2, by + 9, TRAILER_W - 4, 4, 'rgba(28, 25, 23, 0.5)');
  ctx.fillStyle = 'rgba(28, 25, 23, 0.6)'; ctx.fillRect(x + TRAILER_W + 8, by + 30, 44, 4);
  ROOF_FIRES.forEach((f, i) => {
    ctx.save();
    ctx.translate(x + f.dx, by + f.dy);
    // (leaning back off the way it's going)
    ctx.transform(1, 0, 0.45, 1, 0, 0);
    drawFire(ctx, 0, 0, f.w, f.h, frame, { seed: 11 + i * 17, smoke: 0.6, glow: 0.7 });
    ctx.restore();
  });
};

/**
 * The truck itself, its top-left at (x, y) (it's TRUCK_W long, TRUCK_H tall, facing right), moving (speed lines
 * behind it) or parked. (Dale drives it through his arena, and loads it out in the desert.)
 */
/**
 * The truck in a scene (the landing): its back left open from the loading, the near door of the cab swung open (0..1),
 * who's at the wheel (the goon in shades by default; null, nobody; or drawn by the scene, about the middle of the
 * window, clipped to the glass). Whoever's climbing in is drawn by the scene over the truck, then drawCabDoorOver.
 */
export interface TruckScene {
  rearOpen?: boolean;
  door?: number;
  driver?: ((ctx: Ctx, x: number, y: number) => void) | null;
}

/** The cab's near door, from the truck's x and top: its opening (the hinge on the right), the handle, the window. */
export const CAB_DOOR = { x1: TRAILER_W + 10, x2: TRAILER_W + 60, top: 34, bottom: TRUCK_H - 16, handleX: TRAILER_W + 50, handleY: 75, windowX: TRAILER_W + 34, windowY: 52 };

export const drawDeliveryTruck = (ctx: Ctx, x: number, y: number, frame: number, crashing = false, moving = false, speed = 0, scene: TruckScene = {}) => {
  // Rattling over the floor; out of control it bucks and fishtails on its rims
  const bounce = crashing ? Math.sin(frame * 1.7) * 3 + 4 : moving ? Math.sin(frame * 0.9) * 1.2 : 0;
  const lean = crashing ? Math.sin(frame * 0.6) * 0.05 - 0.02 : 0;
  if (moving) drawShadowAndSpeedLines(ctx, x, y, frame);
  else drawShadow(ctx, x, y);
  ctx.save();
  ctx.translate(x + TRUCK_W / 2, y + TRUCK_H);
  ctx.rotate(lean);
  ctx.translate(-(x + TRUCK_W / 2), -(y + TRUCK_H) + bounce);
  drawTrailer(ctx, x, y, scene.rearOpen ? (moving ? frame : -1) : undefined);
  drawCab(ctx, x + TRAILER_W + 6, y, frame, scene);
  ctx.restore();
  // Wheels roll with the truck (flat once the tires are blown)
  const spin = wheelTurn(x, speed, WHEEL_R, frame);
  [x + 46, x + 96, x + 196, x + TRAILER_W + 62].forEach(wx => drawWheel(ctx, wx, y + TRUCK_H - WHEEL_R + 2, spin, crashing));
};

export const DELIVERY_TRUCK = { w: TRUCK_W, h: TRUCK_H };

/** Flashing "!" at the door so you know it's coming: a road sign, inked, its face in steps. */
const drawIncomingWarning = (ctx: Ctx, frame: number) => {
  if (Math.floor(frame / 15) % 2 !== 0) return;
  const wx = BOSS_DOOR_X + 50, wy = 350;
  ctx.save();
  const tri = (r: number) => { ctx.beginPath(); ctx.moveTo(wx, wy - 30 - r); ctx.lineTo(wx + 30 + r * 1.2, wy + 30 + r * 0.6); ctx.lineTo(wx - 30 - r * 1.2, wy + 30 + r * 0.6); ctx.closePath(); };
  // (the white rim, the red face, lit up its left edge, the shadow along the bottom)
  tri(4); ctx.fillStyle = '#F8FAFC'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); tri(0); ctx.clip();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(wx - 40, wy - 40, 80, 80);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(wx - 40, wy - 40, 36, 80);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(wx - 40, wy + 22, 80, 10);
  ctx.restore();
  tri(0); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = 'bold 26px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = INK; ctx.fillText('!', wx + 2, wy + 24); ctx.fillStyle = '#FFFFFF'; ctx.fillText('!', wx, wy + 22);
  ctx.restore();
};

/** The shadow under it, in two steps. */
const drawShadow = (ctx: Ctx, x: number, y: number) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; ctx.beginPath(); ctx.ellipse(x + TRUCK_W / 2, y + TRUCK_H - 2, TRUCK_W / 2 + 12, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; ctx.beginPath(); ctx.ellipse(x + TRUCK_W / 2, y + TRUCK_H - 2, TRUCK_W / 2 - 10, 6, 0, 0, Math.PI * 2); ctx.fill();
};

const drawShadowAndSpeedLines = (ctx: Ctx, x: number, y: number, frame: number) => {
  drawShadow(ctx, x, y);
  // (speed lines streaming off the back: a bright head, a fainter tail)
  for (let i = 0; i < 5; i++) {
    const ly = y + 18 + i * 24;
    const len = 50 + ((frame * 7 + i * 37) % 60);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; ctx.fillRect(x - 12 - len, ly - 1, len, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(x - 12 - len * 0.45, ly - 1, len * 0.45, 3);
  }
};

/**
 * A trailer box (x .. x + w, top .. top + h): white sheet over ribs in banded steps (lit up top, going grey to the
 * skirt), each rib lit on one side and shadowed on the other, rivets along the seams, the roof rail and its marker
 * lamps, inked round. The convoy's semis are drawn with it too.
 */
export const trailerBox = (ctx: Ctx, x: number, top: number, w: number, h: number, rib = 18) => {
  bandedGradient(ctx, x, top, w, h, ['#FFFFFF', '#F1F2F4', '#E2E4E8', '#C9CDD3', '#A3A9B2'], 6);
  for (let rx = x + rib - 4; rx < x + w - 4; rx += rib) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(rx, top + 3, 1, h - 6);
    ctx.fillStyle = 'rgba(55, 65, 81, 0.28)'; ctx.fillRect(rx + 1, top + 3, 2, h - 6);
  }
  ctx.fillStyle = 'rgba(55, 65, 81, 0.5)';
  for (let rx = x + 6; rx < x + w - 2; rx += 9) { ctx.fillRect(rx, top + 5, 1, 1); ctx.fillRect(rx, top + h - 6, 1, 1); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, top, w, h);
  // The roof rail, its amber lamps (a glint on each)
  slab(ctx, x - 2, top - 4, w + 4, 6, '#4B5563', 1);
  for (let mx = x + 20; mx < x + w - 6; mx += 58) { ink(ctx, () => ctx.rect(mx, top - 6, 8, 4), '#F59E0B', 0.8); ctx.fillStyle = '#FEF3C7'; ctx.fillRect(mx + 1, top - 5, 2, 1); }
};

/** The rear doors of a box: two leaves, the lock bars down them, the hinges. */
export const rearDoors = (ctx: Ctx, x: number, top: number, h: number, w = 22) => {
  ctx.fillStyle = 'rgba(55, 65, 81, 0.18)'; ctx.fillRect(x, top, w, h);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, top + 0.5, w, h);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 1, top + 1, 1, h - 1);
  for (const bx of [x + 6, x + w - 7]) { column(ctx, bx, top + 3, 3, h - 6, '#9CA3AF'); slab(ctx, bx - 2, top + h / 2 - 5, 7, 10, '#6B7280', 1); }
  for (const hy of [top + 8, top + h - 14]) slab(ctx, x + w - 2, hy, 4, 6, '#6B7280', 1);
};

/**
 * The back of the box hanging open: the dark inside past the frame, the crates already loaded stacked in there, and a
 * door leaf swung out behind it (its inside face to us, the lock bar down it), banging back and forth once it's moving
 * (`frame` -1: parked, still).
 */
const openRear = (ctx: Ctx, x: number, top: number, h: number, frame: number) => {
  // (the inside: dark, darker toward the back, the floor lit at the lip)
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 3, top, 24, h);
  ctx.fillStyle = '#292524'; ctx.fillRect(x + 3, top, 8, h);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + 3, top + h - 3, 24, 3);
  // (crates in there, stacked, in the gloom)
  for (const [cx, cy] of [[x + 9, top + h - 27], [x + 9, top + h - 51], [x + 13, top + h - 75]] as const) {
    ctx.fillStyle = '#5B3A0E'; ctx.fillRect(cx, cy, 16, 24);
    ctx.fillStyle = '#7C4A0E'; ctx.fillRect(cx, cy, 16, 1); ctx.fillRect(cx, cy, 1, 24);
    ctx.fillStyle = '#3F2A10'; ctx.fillRect(cx + 15, cy, 1, 24); ctx.fillRect(cx, cy + 23, 16, 1);
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 3.5, top + 0.5, 23, h);
  // The leaf, out behind on its hinges (swinging, foreshortened, when it's being bounced along)
  const w = frame < 0 ? 24 : Math.round(8 + 16 * Math.abs(Math.cos(frame * 0.35)));
  slab(ctx, x - w + 1, top, w, h, '#D1D5DB', 1);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - w + 3, top + 4, Math.max(1, w - 5), 1); ctx.fillRect(x - w + 3, top + h - 6, Math.max(1, w - 5), 1);
  column(ctx, x - Math.round(w / 2) - 1, top + 3, 3, h - 6, '#9CA3AF');
  for (const hy of [top + 8, top + h - 14]) slab(ctx, x - 2, hy, 4, 6, '#6B7280', 1);
};

/** The livery band (x .. x + w): purple stepped toward the light in the middle, gold pinstripes top and bottom. */
export const liveryBand = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  const steps = ['#3B1677', '#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED'];
  for (let k = 0; k < 5; k++) { const inset = k * w * 0.1; ctx.fillStyle = steps[k]; ctx.fillRect(x + inset, y, w - inset * 2, h); }
  // (a sheen across the top of it, and the dark under the bottom stripe)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.fillRect(x, y + 3, w, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; ctx.fillRect(x, y + h - 9, w, 6);
  for (const sy of [y, y + h - 3]) { ctx.fillStyle = '#FDE047'; ctx.fillRect(x, sy, w, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(x, sy + 2, w, 1); }
  ctx.fillStyle = INK; ctx.fillRect(x, y - 1, w, 1); ctx.fillRect(x, y + h, w, 1);
};

/** The trailer; `open` (the frame, or -1 parked) has its back hanging open. */
const drawTrailer = (ctx: Ctx, x: number, y: number, open?: number) => {
  const top = y + 4, h = 120;
  trailerBox(ctx, x, top, TRAILER_W, h);
  if (open === undefined) rearDoors(ctx, x + 4, top + 6, h - 12);
  else openRear(ctx, x, top + 6, h - 12, open);
  // The livery: a purple band with the sign on it
  const bandY = top + 22, bandH = 76;
  liveryBand(ctx, x + 32, bandY, TRAILER_W - 40, bandH);

  // Pill logo (inked, the red half lit along the top, the white half shadowed underneath, a glint)
  const px = x + 58, py = bandY + bandH / 2;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.6);
  const capsule = () => { ctx.beginPath(); ctx.arc(-6, 0, 9, Math.PI / 2, Math.PI * 1.5); ctx.lineTo(6, -9); ctx.arc(6, 0, 9, -Math.PI / 2, Math.PI / 2); ctx.closePath(); };
  ctx.save(); capsule(); ctx.clip();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-16, -10, 16, 20); ctx.fillStyle = '#F87171'; ctx.fillRect(-16, -10, 16, 5);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, -10, 16, 20); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(0, 4, 16, 6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-10, -6, 5, 2);
  ctx.restore();
  capsule(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(-0.5, -9, 1, 18);
  ctx.restore();

  // DALE'S DRUGS
  const textX = x + 32 + (TRAILER_W - 40) / 2 + 18;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.font = 'bold 15px "Press Start 2P"';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#1E1B4B';
  ctx.strokeText("DALE'S", textX, bandY + 30);
  ctx.fillStyle = '#A16207'; ctx.fillText("DALE'S", textX, bandY + 31);
  ctx.fillStyle = '#FDE047'; ctx.fillText("DALE'S", textX, bandY + 30);
  ctx.font = 'bold 20px "Press Start 2P"';
  ctx.strokeText('DRUGS', textX, bandY + 58);
  ctx.fillStyle = '#BE185D'; ctx.fillText('DRUGS', textX, bandY + 59);
  ctx.fillStyle = '#F472B6'; ctx.fillText('DRUGS', textX, bandY + 58);
  ctx.font = '6px "Press Start 2P"';
  ctx.fillStyle = '#E9D5FF';
  ctx.fillText('NO QUESTIONS ASKED', textX, bandY + 71);
  ctx.textAlign = 'left';

  // Chassis and mudflaps
  pipe(ctx, x + 2, top + h, TRAILER_W + 6, 10, '#374151');
  for (const mx of [x + 120, x + 228]) { slab(ctx, mx, top + h + 4, 8, 18, '#18181B', 1); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(mx + 2, top + h + 15, 4, 2); }
};

/**
 * The near door swung open (0..1) on its hinges at the front: the cab's insides in the doorway (the seat, the wheel,
 * the step up), whatever the scene has in there, then the door itself, its inside face to us, foreshortened toward
 * the hinge.
 */
const drawCabDoorway = (ctx: Ctx, x: number, top: number, bottom: number, open: number) => {
  const x1 = x + 4, x2 = x + 54, y1 = top + 4, y2 = bottom - 2;
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  // (the windshield's light coming in over the dash)
  ctx.fillStyle = '#2D5285'; ctx.fillRect(x2 - 10, y1 + 2, 8, 26);
  ctx.fillStyle = '#1E3A5F'; ctx.fillRect(x2 - 10, y1 + 2, 8, 4);
  // (the seat: its back, the cushion, the stitching)
  slab(ctx, x1 + 4, y1 + 14, 10, 40, '#57534E', 1);
  slab(ctx, x1 + 4, y1 + 48, 30, 10, '#57534E', 1);
  ctx.fillStyle = '#78716C'; ctx.fillRect(x1 + 6, y1 + 24, 6, 1); ctx.fillRect(x1 + 6, y1 + 34, 6, 1);
  // (the wheel, on its column)
  ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x2 - 4, y1 + 40); ctx.lineTo(x2 - 12, y1 + 28); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x2 - 16, y1 + 20); ctx.lineTo(x2 - 8, y1 + 36); ctx.stroke();
  // (the step up, chrome)
  slab(ctx, x1 + 2, y2 - 4, x2 - x1 - 4, 4, '#D1D5DB', 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x1 + 0.5, y1 + 0.5, x2 - x1 - 1, y2 - y1 - 1);
  cabDoorPanel(ctx, x1, x2, y1, y2, open);
};

/** The near door of the parked truck at (truckX, truckY), open (0..1), over whoever's getting in through it. */
export const drawCabDoorOver = (ctx: Ctx, truckX: number, truckY: number, open: number) => {
  if (open > 0) cabDoorPanel(ctx, truckX + CAB_DOOR.x1, truckX + CAB_DOOR.x2, truckY + CAB_DOOR.top, truckY + CAB_DOOR.bottom, open);
};

/** The door itself: shrinking toward its hinge as it swings out at us, the inside panel, the window frame, the pull. */
const cabDoorPanel = (ctx: Ctx, x1: number, x2: number, y1: number, y2: number, open: number) => {
  const w = Math.max(3, Math.round((x2 - x1) * (1 - 0.72 * open)));
  const dx = x2 - w;
  slab(ctx, dx, y1 - 2, w, y2 - y1 + 2, '#991B1B', 1);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(dx + 1, y1 + 34, w - 2, 2);
  if (w > 6) {
    ctx.fillStyle = '#1E3A5F'; ctx.fillRect(dx + 2, y1 + 3, w - 4, 26);
    ctx.fillStyle = '#2D5285'; ctx.fillRect(dx + 2, y1 + 3, w - 4, 5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(dx + 2 + Math.round((w - 4) * 0.6), y1 + 4, 1, 24);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(dx + 1.5, y1 + 2.5, w - 3, 27);
    slab(ctx, dx + 2, y1 + 44, Math.min(8, w - 3), 3, '#D1D5DB', 1);
  }
};

/** A stepped headlight beam off (x, y0 .. y1) out to len, going dir: three steps of light, brightest nearest. */
export const headBeam = (ctx: Ctx, x: number, y0: number, y1: number, len: number, spread: number, dir = 1, a = 0.5) => {
  for (let k = 0; k < 3; k++) {
    const l0 = len * k / 3, l1 = len * (k + 1) / 3, s0 = spread * k / 3, s1 = spread * (k + 1) / 3;
    ctx.fillStyle = `rgba(255, 244, 180, ${(a * (1 - k / 3)).toFixed(3)})`;
    ctx.beginPath(); ctx.moveTo(x + dir * l0, y0 - s0 * 0.6); ctx.lineTo(x + dir * l1, y0 - s1 * 0.6); ctx.lineTo(x + dir * l1, y1 + s1); ctx.lineTo(x + dir * l0, y1 + s0); ctx.closePath(); ctx.fill();
  }
};

/** A puff of exhaust (t 0..1 along its life): a chunky dark blob, thinning as it goes. */
export const exhaust = (ctx: Ctx, x: number, y: number, r: number, t: number, a = 0.5) => {
  pixelBlob(ctx, x, y, r, r * 0.85, `rgba(30, 30, 30, ${(a * (1 - t)).toFixed(3)})`);
  pixelBlob(ctx, x - r * 0.25, y - r * 0.25, r * 0.5, r * 0.45, `rgba(80, 80, 80, ${(a * 0.7 * (1 - t)).toFixed(3)})`);
};

/** A shape in red paint (`path` draws it, spanning top .. bottom): lit along the top, the red, the shadow down low; inked. */
export const redPaint = (ctx: Ctx, path: () => void, x: number, top: number, w: number, bottom: number, line = 2) => {
  const h = bottom - top;
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(x - 4, top - 4, w + 8, h + 8);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(x - 4, top - 4, w + 8, 4 + h * 0.12);
  ctx.fillStyle = '#F87171'; ctx.fillRect(x - 4, top - 4, w + 8, 6);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 4, top + h * 0.12, w + 8, h * 0.2);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(x - 4, top + h * 0.66, w + 8, h * 0.2);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x - 4, top + h * 0.86, w + 8, h * 0.14 + 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; ctx.fillRect(x + w - 6, top - 4, 6, h + 8);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.lineJoin = 'round'; ctx.stroke();
};

const drawCab = (ctx: Ctx, x: number, y: number, frame: number, scene: TruckScene = {}) => {
  const w = 92, top = y + 30, bottom = y + TRUCK_H - 14;
  // Exhaust stack puffing black smoke
  column(ctx, x + 4, y - 14, 7, top - y + 20, '#C0C4CA');
  slab(ctx, x + 2, y - 16, 11, 5, '#71717A', 1);
  for (let i = 0; i < 3; i++) {
    const t = ((frame * 2 + i * 13) % 40) / 40;
    exhaust(ctx, x + 7 - t * 30, y - 20 - t * 26, 5 + t * 9, t, 0.55);
  }

  // Body: sloped windshield, long hood
  const body = () => {
    ctx.moveTo(x, bottom);
    ctx.lineTo(x, top);
    ctx.lineTo(x + 46, top);
    ctx.lineTo(x + 60, top + 36);
    ctx.lineTo(x + w - 4, top + 42);
    ctx.quadraticCurveTo(x + w + 2, top + 44, x + w + 2, top + 52);
    ctx.lineTo(x + w + 2, bottom);
    ctx.closePath();
  };
  redPaint(ctx, body, x, top, w + 2, bottom, 3);
  // (the door's seam and its handle)
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 54, top + 38, 1, bottom - top - 40); ctx.fillRect(x + 4, top + 40, 1, bottom - top - 44);
  slab(ctx, x + 40, top + 44, 8, 3, '#D1D5DB', 1);
  // Flame decal down the side (yellow licks with an orange heart, inked)
  const flame = (inset: number) => {
    ctx.beginPath();
    ctx.moveTo(x + 6 + inset, bottom - 18 + inset * 0.5);
    for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(x + 18 + i * 18, bottom - 34 + inset * 2, x + 24 + i * 18, bottom - 22 + inset);
    ctx.lineTo(x + 90 - inset, bottom - 12 - inset * 0.3);
    ctx.lineTo(x + 6 + inset, bottom - 10 - inset * 0.3);
    ctx.closePath();
  };
  flame(0); ctx.fillStyle = '#FBBF24'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  flame(3); ctx.fillStyle = '#F97316'; ctx.fill();
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 20, bottom - 25, 6, 1); ctx.fillRect(x + 56, bottom - 25, 6, 1);

  // Tinted window with the driver (a goon in shades, unless the scene's got someone else in there, or nobody)
  const glass = () => { ctx.moveTo(x + 8, top + 6); ctx.lineTo(x + 42, top + 6); ctx.lineTo(x + 54, top + 34); ctx.lineTo(x + 8, top + 34); ctx.closePath(); };
  const door = scene.door ?? 0;
  if (door > 0) {
    drawCabDoorway(ctx, x, top, bottom, door);
  } else {
    ctx.save(); ctx.beginPath(); glass(); ctx.clip();
    ctx.fillStyle = '#1E3A5F'; ctx.fillRect(x + 8, top + 6, 48, 28);
    ctx.fillStyle = '#2D5285'; ctx.fillRect(x + 8, top + 6, 48, 6);
    if (scene.driver === undefined) {
      // (him: a head, the shades, his shoulders)
      ink(ctx, () => ctx.ellipse(x + 28, top + 22, 8, 9, 0, 0, Math.PI * 2), '#1F2937', 1);
      ink(ctx, () => ctx.roundRect(x + 16, top + 29, 24, 10, 3), '#111827', 1);
      ctx.fillStyle = '#0A0A0A'; ctx.fillRect(x + 22, top + 19, 14, 4);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 31, top + 19, 2, 1);
    } else if (scene.driver) {
      // (whoever the scene's put at the wheel, through the tint)
      scene.driver(ctx, x + 28, top + 22);
      ctx.fillStyle = 'rgba(30, 58, 95, 0.3)'; ctx.fillRect(x + 8, top + 6, 48, 28);
    } else {
      // (empty: the seat back and the wheel)
      slab(ctx, x + 12, top + 16, 9, 20, '#44403C', 1);
      ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 40, top + 34); ctx.lineTo(x + 46, top + 22); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath(); ctx.moveTo(x + 36, top + 8); ctx.lineTo(x + 41, top + 8); ctx.lineTo(x + 28, top + 32); ctx.lineTo(x + 23, top + 32); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.beginPath(); glass(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // Mirror
  slab(ctx, x + 50, top + 10, 4, 14, '#D1D5DB', 1);

  // Chrome grille, bumper and a blazing headlight
  slab(ctx, x + w - 6, top + 50, 10, 30, '#E5E7EB', 1);
  for (let gy = top + 54; gy < top + 78; gy += 4) { ctx.fillStyle = '#6B7280'; ctx.fillRect(x + w - 5, gy, 8, 1); }
  slab(ctx, x + w - 10, bottom - 6, 18, 8, '#D1D5DB', 1);
  headBeam(ctx, x + w + 2, top + 44, top + 50, 90, 22, 1, 0.5);
  ink(ctx, () => ctx.rect(x + w - 2, top + 43, 6, 8), '#FEF08A', 1);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + w - 1, top + 44, 2, 2);

  // Plate
  slab(ctx, x + w - 30, bottom - 20, 24, 10, '#F9FAFB', 1);
  ctx.fillStyle = '#111111';
  ctx.font = '5px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('D34L3R', x + w - 18, bottom - 12);
  ctx.textAlign = 'left';
};

/**
 * A truck's wheel (its middle at x, y, radius r) turned `spin`: the tire inked, tread blocks round it going by, its
 * sidewall lit upper left, the steel rim in steps, five spokes and their lug nuts, the hub and its glint. Flat: the
 * tire slumped, flapping, the rim riding low.
 */
export const drawTruckWheel = (ctx: Ctx, x: number, y: number, r: number, spin: number, flat = false) => {
  if (flat) {
    // Blown out: the tire slumps and flaps, the rim rides low
    ink(ctx, () => ctx.ellipse(x, y + 8, r + 4, r * 0.55, 0, 0, Math.PI * 2), '#18181B', 1.5);
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - r * 0.7, y + 3, r * 1.4, 2);
    slab(ctx, x - r - 6, y + 10 + Math.sin(spin * 3) * 3, 10, 4, '#27272A', 1);
    y += 6;
  } else {
    ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#18181B', 1.5);
    // (the tread, going round)
    ctx.fillStyle = '#3F3F46';
    for (let k = 0; k < 12; k++) { const a = spin + (k * Math.PI) / 6; ctx.fillRect(x + Math.cos(a) * (r - 2.5) - 1.5, y + Math.sin(a) * (r - 2.5) - 1.5, 3, 3); }
    ctx.strokeStyle = '#52525B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.78, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
  }
  const rr = r * 0.56;
  ink(ctx, () => ctx.arc(x, y, rr, 0, Math.PI * 2), '#9CA3AF', 1);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(x, y, rr - 1.5, Math.PI * 1.0, Math.PI * 1.5); ctx.stroke();
  ctx.strokeStyle = '#6B7280'; ctx.beginPath(); ctx.arc(x, y, rr - 1.5, 0, Math.PI * 0.5); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = spin + (i * Math.PI * 2) / 5;
    ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * rr * 0.9, y + Math.sin(a) * rr * 0.9); ctx.stroke();
    ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x + Math.cos(a + 0.6) * rr * 0.55 - 1, y + Math.sin(a + 0.6) * rr * 0.55 - 1, 2, 2);
  }
  ink(ctx, () => ctx.arc(x, y, Math.max(2.5, r * 0.18), 0, Math.PI * 2), '#E5E7EB', 1);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 2, y - 2, 1.5, 1.5);
};

const drawWheel = (ctx: Ctx, x: number, y: number, spin: number, flat: boolean) => drawTruckWheel(ctx, x, y, WHEEL_R, spin, flat);
