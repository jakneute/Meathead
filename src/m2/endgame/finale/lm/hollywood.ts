import { type Ctx, INK, R, blockI, poly, ell, line, txt, sign, windows, tree, lattice, track, star, braces } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// HOLLYWOOD LAND (the reference: done properly)

/** HAPPYWOOD BOULEVARD: the arch over the start, the one-sheet plywood fronts (deco, mission, brick) braced at the back,
 *  the ROOSEVELT-ISH HOTEL with its rooftop sign, palms, the Walk of Fame's stars along the pavement. */
export const paintBlvd = (g: Ctx) => {
  R(g, -110, -4, 220, 4, '#C9B8A0'); for (let x = -104; x < 110; x += 12) star(g, x, -2, 3, '#E8B4C8');
  // (the fronts: cut-out silhouettes on 2x4s; each a different style)
  const front = (x: number, w: number, h: number, col: string, lit: string, top: 'deco' | 'mission' | 'flat') => {
    braces(g, x, w, h);
    blockI(g, x, -h, w, h, col, lit, '#6A5440');
    if (top === 'deco') { poly(g, [x, -h, x + w * 0.2, -h - 6, x + w * 0.5, -h - 10, x + w * 0.8, -h - 6, x + w, -h], col); R(g, x + w / 2 - 1, -h - 10, 2, 4, '#E8C44A'); }
    if (top === 'mission') { g.beginPath(); g.moveTo(x, -h); g.quadraticCurveTo(x + w / 2, -h - 14, x + w, -h); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.stroke(); }
    windows(g, x + 3, -h + 5, w - 6, h - 14, 3, 2, '#3A4A5A', '#FDE68A', w);
    R(g, x + w / 2 - 4, -8, 8, 8, '#2A1C14');
  };
  front(-96, 30, 24, '#E8DCC4', '#FFFFFF', 'deco');
  front(-62, 26, 20, '#D9A878', '#F6D0A8', 'mission');
  front(30, 26, 22, '#A8503A', '#D07858', 'flat');
  front(60, 32, 26, '#E0D0A8', '#FFF6D8', 'deco');
  // (the hotel: tall, arched windows, its sign up on the roof on its frame)
  blockI(g, -30, -44, 56, 44, '#E4D4B4', '#FFF8E4', '#7A6444');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { R(g, -26 + c * 10.6, -40 + r * 9, 5, 6, (c + r) % 4 ? '#3A4A60' : '#FDE68A'); R(g, -26 + c * 10.6, -41 + r * 9, 5, 1, '#B49870'); }
  for (let k = 0; k < 5; k++) R(g, -24 + k * 10, -54, 1, 10, '#4A4040');
  sign(g, 'ROOSEVELT-ISH', -2, -58, -58, '#B91C1C', '#FDE68A', 5, false);
  // (the arch over it all: two pylons and the span with its name)
  for (const x of [-108, 96]) blockI(g, x, -40, 10, 40, '#E0C068', '#FFF0B0', '#8A6A20');
  R(g, -108, -46, 214, 7, INK); R(g, -107, -45, 212, 5, '#F2D27A'); R(g, -107, -45, 212, 1, '#FFF8D0');
  txt(g, 'HAPPYWOOD BLVD', 0, -41, '#7A1A1A', 5);
  for (const x of [-74, 2, 92]) tree(g, x, 34, 'palm', ['#3F8A3A', '#6ABF5A']);
};

/** GROWMAN'S CHINA-ISH THEATRE: the plywood pagoda roof up on red columns, the marquee, the forecourt's concrete. */
export const paintChinaish = (g: Ctx) => {
  R(g, -46, -4, 92, 4, '#B8AC9C');
  for (let k = 0; k < 6; k++) { R(g, -42 + k * 2.6, -2.6 + (k % 2), 2, 1, '#8A7E70'); }
  blockI(g, -34, -30, 68, 30, '#9A2A22', '#D2584A', '#4A0E0A');
  for (const x of [-30, -16, 12, 26]) blockI(g, x, -28, 4, 28, '#C8382C', '#F07860', '#5A1410');
  R(g, -10, -22, 20, 22, '#1A0E0A'); R(g, -9, -21, 18, 1, '#5A2A1A');
  // (the pagoda roof: two tiers, green, up-turned at the ends; the plywood's edge showing at the back)
  const tier = (y: number, hw: number, th: number) => { poly(g, [-hw - 6, y, -hw, y - th, hw, y - th, hw + 6, y, hw + 8, y - 3, -hw - 8, y - 3], '#2E6A4A'); R(g, -hw, y - th, hw * 2, 1, '#7ACB9A'); };
  tier(-30, 34, 8); blockI(g, -22, -46, 44, 9, '#9A2A22', '#D2584A', '#4A0E0A'); tier(-46, 22, 8);
  R(g, -1, -60, 2, 6, '#E8C44A');
  sign(g, "GROWMAN'S", 0, -38, -38, '#FDE68A', '#7A1A1A', 5, false);
};

/** THRONES OF THE STARS: the red steel lattice coaster (the lift hill, the loop, the top hat, the drop), its train of
 *  toilets, the station's fake bathroom (tiled, the gold-star stalls), its sign held up on its frame. */
export const paintThrones = (g: Ctx) => {
  const W = 150;
  // (the station: a fake bathroom out of doors, tiled white, a STAFF ONLY door)
  blockI(g, -W, -22, 50, 22, '#E8EEF0', '#FFFFFF', '#98A4A8');
  for (let x = -W + 2; x < -W + 50; x += 4) for (let y = -20; y < 0; y += 4) R(g, x, y, 3, 3, (x + y) % 8 ? '#F4F8FA' : '#D4DEE2');
  for (let k = 0; k < 3; k++) { R(g, -W + 6 + k * 14, -16, 9, 16, '#C49A3A'); star(g, -W + 10.5 + k * 14, -11, 2.5, '#FFF2A0'); }
  // (the track: up the lift, over the top hat, down the drop, round the loop, the corkscrew's hump, back in)
  const pts: number[] = [];
  const add = (x: number, y: number) => pts.push(x, y);
  add(-100, -14); add(-70, -70); add(-58, -84); add(-46, -80); add(-36, -20); add(-26, -8);
  for (let k = 0; k <= 20; k++) { const a = Math.PI / 2 - (k / 20) * Math.PI * 2; add(4 + Math.cos(a) * 22, -34 - Math.sin(a) * 26); }
  add(30, -10); add(60, -40); add(84, -46); add(104, -24); add(126, -30); add(146, -12);
  const topAt = (x: number) => { let best = 0; for (let i = 0; i < pts.length; i += 2) if (Math.abs(pts[i] - x) < 6) best = Math.min(best, pts[i + 1]); return best; };
  lattice(g, -98, 146, topAt, 8, '#6A1410');
  track(g, pts, '#C81E1E', '#FF7A6A', 3);
  // (the train: toilets on the lift, their seats up, a guest's head in one)
  for (let k = 0; k < 4; k++) {
    const x = -94 + k * 7, y = -18 - k * 12;
    R(g, x - 3, y - 5, 6, 5, INK); R(g, x - 2, y - 4, 4, 3, '#F8FAFC'); R(g, x - 2, y - 7, 4, 3, '#E5E7EB'); if (k === 1) R(g, x - 1, y - 9, 2, 2, '#E8B48A');
  }
  sign(g, 'THRONES OF THE STARS', -62, -104, -88, '#7C3AED', '#FDE68A', 6, true);
  for (const x of [-136, 134]) tree(g, x, 30, 'palm', ['#3F8A3A', '#6ABF5A']);
};

/** The REVENGERS' secret warehouse: corrugated siding, red-oxide I-beams, the clerestory, the poster banner, the
 *  green-screen glimpsed through the bay door, the craft-services tent. */
export const paintWarehouse = (g: Ctx) => {
  const W = 76, H = 48;
  blockI(g, -W, -H, W * 2, H, '#8E969C', '#C4CCD2', '#4A5258');
  for (let x = -W + 2; x < W; x += 3) R(g, x, -H + 1, 1, H - 2, '#7A8288');
  for (const x of [-W, -W / 2, 0, W / 2, W - 4]) R(g, x, -H, 4, H, '#8A3A22');
  R(g, -W, -H - 6, W * 2, 6, '#8A3A22'); R(g, -W + 4, -H - 5, W * 2 - 8, 3, '#B4BCC4');
  for (let k = 0; k < 10; k++) R(g, -W + 8 + k * 15, -H - 5, 8, 3, '#C8E2F2');
  // (the bay door up: the green screen behind it, a mocap suit, a light stand)
  R(g, -20, -30, 40, 30, '#1A1A1A'); R(g, -18, -28, 36, 28, '#2FBF4A'); R(g, -18, -28, 36, 2, '#6AE07A');
  R(g, -6, -16, 3, 14, '#111827'); ell(g, -4.5, -18, 2, 2, '#111827', false); for (let k = 0; k < 4; k++) R(g, -6, -15 + k * 4, 1, 1, '#F8FAFC');
  R(g, 10, -24, 1, 22, '#4B5563'); R(g, 7, -26, 7, 4, '#E5E7EB');
  // (the banner: REVENGERS: END-OF-THE-WORLD'S-DAY)
  sign(g, 'REVENGERS', -44, -42, -42, '#7F1D1D', '#FDE047', 6, false);
  txt(g, "END-OF-THE-WORLD'S-DAY", -44, -24, '#F8FAFC', 4);
  // (craft services: a striped tent, a table of donuts)
  poly(g, [52, -16, 64, -26, 76, -16], '#F8FAFC'); for (let k = 0; k < 4; k++) poly(g, [52 + k * 6, -16, 58 + k * 6, -16, 64, -26], k % 2 ? '#DC2626' : '#F8FAFC', false);
  R(g, 54, -10, 20, 2, '#A16207'); for (let k = 0; k < 4; k++) ell(g, 57 + k * 5, -11, 1.5, 1, '#F9A8D4', false);
};

/** The backlot: NEW YORK STREET's brick tenements (DELI, PAWN with its gold balls), THE WESTERN TOWN's saloon false
 *  front, the fake suburb's one house over and over; the flood tank's dry concrete. */
export const paintBacklot = (g: Ctx) => {
  // (New York: two tenements, fire escapes, a deli awning, the pawn shop's balls)
  for (const [x, w, h, col] of [[-86, 34, 38, '#8A3A2A'], [-50, 30, 32, '#7A4636']] as const) {
    braces(g, x, w, h); blockI(g, x, -h, w, h, col, '#C07060', '#3A1A12'); windows(g, x + 3, -h + 4, w - 6, h - 14, 3, 3, '#26303C', '#FDE68A', w);
    for (let r = 0; r < 2; r++) R(g, x + 4, -h + 12 + r * 9, w - 8, 1, '#1A1A1A');
  }
  for (let k = 0; k < 4; k++) R(g, -84 + k * 8, -10, 8, 3, k % 2 ? '#F8FAFC' : '#15803D'); txt(g, 'DELI', -70, -12, '#FDE047', 4);
  for (const dx of [-2, 2]) ell(g, -38 + dx, -18, 1.5, 1.5, '#E8C44A'); ell(g, -38, -21, 1.5, 1.5, '#E8C44A');
  // (the western town: the saloon's false front, the board-and-batten, swinging doors)
  braces(g, -10, 36, 34); blockI(g, -10, -34, 36, 34, '#9A6A3A', '#D0A06A', '#4A2E14');
  for (let x = -8; x < 26; x += 3) R(g, x, -32, 1, 32, '#7E5630');
  R(g, -10, -40, 36, 6, '#9A6A3A'); txt(g, 'SALOON', 8, -35, '#2A1A0A', 4); R(g, 3, -12, 10, 10, '#3A2414');
  // (the suburb: the one clapboard house, three times)
  for (let k = 0; k < 3; k++) { const x = 34 + k * 20; blockI(g, x, -14, 16, 14, '#E8E0C8', '#FFFFFF', '#8A8270'); poly(g, [x - 2, -14, x + 8, -22, x + 18, -14], '#5A6A7A'); R(g, x + 6, -8, 4, 8, '#7A2A1A'); }
};

/** THE HAPPYWOOD WATER TOWER: about 300 ft of enclosed scaffold, the tank up top with its HW. Topples. */
export const paintHwTower = (g: Ctx) => {
  for (const x of [-14, 12]) { R(g, x, -64, 3, 64, '#4A5058'); R(g, x, -64, 1, 64, '#8A9098'); }
  for (let y = -60; y < 0; y += 10) { line(g, -13, y, 14, y + 10, '#5A6068'); line(g, 14, y, -13, y + 10, '#5A6068'); }
  // (the scaffold's netting round the legs, Ben's climb)
  g.fillStyle = 'rgba(40, 60, 90, 0.35)'; g.fillRect(-16, -64, 32, 64);
  ell(g, 0, -74, 20, 13, '#9AA4AC'); R(g, -20, -74, 40, 7, '#9AA4AC'); ell(g, 0, -67, 20, 4, '#7A848C', false);
  ell(g, 0, -86, 14, 5, '#B4BEC6'); R(g, -1, -94, 2, 5, '#4A5058');
  txt(g, 'HW', 0, -68, '#1E3A8A', 8);
};

/** DISASTER: THE RIDE: poured concrete with its cracks painted on, the marquee, the mural, the cow on its wire. */
export const paintDisaster = (g: Ctx) => {
  blockI(g, -52, -36, 104, 36, '#A8A29A', '#D8D2CA', '#5A544E');
  for (const [x, y, l] of [[-40, -30, 8], [-12, -22, 10], [20, -32, 7], [36, -14, 9]] as const) { line(g, x, y, x + 4, y + l * 0.5, '#3A3634'); line(g, x + 4, y + l * 0.5, x + 1, y + l, '#3A3634'); }
  // (the mural: a tornado, a wave, an earthquake's crack: painted, a projection's worth)
  R(g, -46, -30, 30, 20, '#5A7A9A'); poly(g, [-36, -28, -26, -28, -30, -12], '#C8C8D0'); R(g, -46, -14, 30, 4, '#2A6AA8');
  R(g, -8, -12, 16, 12, '#1A1414');
  // (the marquee: DISASTER: THE RIDE, bulbs round it)
  R(g, -40, -48, 80, 12, INK); R(g, -39, -47, 78, 10, '#F8E8B0'); txt(g, 'DISASTER: THE RIDE', 0, -39, '#B91C1C', 5);
  for (let k = 0; k < 14; k++) R(g, -38 + k * 5.6, -49, 2, 1, k % 2 ? '#FDE047' : '#FFFFFF');
  // (the cow, flying, on its wire)
  line(g, 30, -62, 46, -40, '#E5E7EB'); ell(g, 44, -46, 6, 3.5, '#F8FAFC'); R(g, 40, -47, 3, 2, INK); R(g, 46, -45, 2, 2, INK); ell(g, 50, -47, 2, 2, '#F8FAFC');
};

/** THE HAPPYWOOD SIGN up its hill: the letters on their posts, plywood (up close), the scrub. */
export const paintHwSign = (g: Ctx) => {
  g.beginPath(); g.moveTo(-110, 0); g.quadraticCurveTo(-60, -34, 0, -38); g.quadraticCurveTo(60, -34, 110, 0); g.closePath(); g.fillStyle = '#9A8A5A'; g.fill(); g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.moveTo(-100, -2); g.quadraticCurveTo(-60, -30, 0, -34); g.quadraticCurveTo(60, -30, 100, -2); g.strokeStyle = '#C8B880'; g.stroke();
  for (let k = 0; k < 14; k++) ell(g, -90 + k * 13, -6 - Math.sin((k / 13) * Math.PI) * 20, 3, 2, '#5A6A2A', false);
  const L = 'HAPPYWOOD';
  for (let i = 0; i < L.length; i++) {
    const x = -72 + i * 18, y = -36 - Math.sin((i / (L.length - 1)) * Math.PI) * 6;
    R(g, x - 1, y + 2, 1, 14, '#5A4A34'); R(g, x + 6, y + 2, 1, 14, '#5A4A34');
    R(g, x - 4, y - 14, 14, 16, INK); R(g, x - 3, y - 13, 12, 14, '#F8FAFC');
    txt(g, L[i], x + 3, y, '#1A1A1A', 10);
  }
};

/** STUNTMAN STEVE'S STUPENDOUS STUNTERY: the extra-wide amphitheater, stands up both ends, the asphalt floor with its
 *  skid marks and STEVE stenciled on his mark, the box truss with its PAR cans, the STEVE-O-VISION jumbotron, the
 *  ramp, the hoops, the crash mats; the street-set backdrop (pawnshop, diner, gas canopy, bank and its clock). */
export const paintStunt = (g: Ctx) => {
  const W = 150;
  // (the street set at the back)
  for (const [x, w, h, col] of [[-90, 30, 30, '#8A3A2A'], [-58, 34, 24, '#2DA3A0'], [-20, 38, 20, '#E5E7EB'], [22, 34, 32, '#C8A878'], [60, 28, 22, '#6A5A8A']] as const) {
    braces(g, x, w, h); blockI(g, x, -h - 8, w, h, col, '#FFFFFF66', '#2A1A14'); windows(g, x + 3, -h - 4, w - 6, h - 10, 3, 2, '#26303C', '#FDE68A', w);
  }
  ell(g, 39, -36, 4, 4, '#F8FAFC');
  // (the floor: asphalt, the skid marks, the big faded star, STEVE)
  R(g, -W + 30, -8, (W - 30) * 2, 8, '#3A3A40'); for (let k = 0; k < 5; k++) { g.strokeStyle = '#1A1A1E'; g.beginPath(); g.arc(-40 + k * 22, -2, 10, Math.PI, Math.PI * 1.8); g.stroke(); }
  star(g, 0, -4, 8, '#8A7A4A'); txt(g, 'STEVE', 40, -2, '#E8E0C0', 4);
  // (the stands: both ends, rising, packed with tiny heads)
  for (const s of [-1, 1]) {
    const x0 = s * W, x1 = s * (W - 34);
    poly(g, [x0, 0, x0, -42, x1, -8, x1, 0], '#6A6E78');
    for (let r = 0; r < 6; r++) { const y = -6 - r * 6, xa = x1 + (x0 - x1) * (r / 6); line(g, xa, y, x0, y, '#9AA0AA'); for (let k = 0; k < 6; k++) R(g, Math.min(xa, x0) + k * 5 + 1, y - 2, 2, 2, ['#F87171', '#FDE047', '#60A5FA', '#E8B48A'][(k + r) % 4]); }
  }
  // (the truss over the floor, its PAR cans; the jumbotron)
  R(g, -W + 34, -62, (W - 34) * 2, 3, '#4B5563'); for (let x = -W + 36; x < W - 34; x += 10) { line(g, x, -62, x + 5, -59, '#6B7280'); R(g, x, -59, 3, 3, '#111827'); R(g, x + 1, -57, 1, 1, '#FDE047'); }
  for (const x of [-W + 34, W - 37]) R(g, x, -62, 3, 54, '#4B5563');
  R(g, -24, -88, 48, 26, INK); R(g, -22, -86, 44, 20, '#0F172A'); txt(g, 'STEVE-O-VISION', 0, -70, '#F59E0B', 4); R(g, -18, -84, 36, 9, '#1E40AF'); txt(g, 'STEVE!', 0, -77, '#FDE047', 5);
  // (the ramp and the hoops, a crash mat)
  poly(g, [-60, -8, -30, -8, -30, -22], '#2563EB');
  for (const x of [-4, 16]) { g.strokeStyle = '#F9A8D4'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, -24, 6, 10, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#F8FAFC'; g.lineWidth = 1; g.stroke(); }
  R(g, 50, -14, 30, 6, '#DC2626'); R(g, 50, -14, 30, 1, '#FCA5A5');
  sign(g, 'STUPENDOUS STUNTERY', 0, -104, -88, '#F59E0B', '#7A1A1A', 5, false);
};
