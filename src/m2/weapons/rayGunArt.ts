// The ray gun in his fist (the engine's pistol made over: render/player/player.ts draws it in the pistol's place), done
// up: a fat chrome bulb in stepped bands, a seam riveted down it, a dent and scuffs; the alien's pink coils round the
// barrel glowing and pulsing, a spark jumping between them now and then; the dish at the muzzle; the fin; the grip
// wrapped round and round in duct tape, a frayed end; the red wire looping back into it. Same shape and muzzle as ever.

import { INK, STEEL, box, ell, poly, dither, rivet, tape, heldStamp, snapOrigin, glint, twinkle } from './heldArt';

type Ctx = CanvasRenderingContext2D;

const paint = (g: Ctx) => {
  // (the wire, behind the grip: inked, red, a lit fleck along it)
  g.strokeStyle = INK; g.lineWidth = 1.7; g.beginPath(); g.moveTo(14, 5); g.quadraticCurveTo(12, 10, 7, 8); g.stroke();
  g.strokeStyle = '#B91C1C'; g.lineWidth = 0.9; g.stroke();
  g.strokeStyle = '#F87171'; g.lineWidth = 0.4; g.beginPath(); g.moveTo(13.4, 6.4); g.quadraticCurveTo(12.2, 8.6, 10, 8.6); g.stroke();
  // (the bulb: chrome in stepped bands, round the light from the top left; dithered between the dark and the mid)
  ell(g, 10, 2.5, 8.5, 4.5, INK);
  ell(g, 10, 2.5, 7.5, 3.6, STEEL[3]);
  g.save(); g.beginPath(); g.ellipse(10, 2.5, 7.5, 3.6, 0, 0, Math.PI * 2); g.clip();
  ell(g, 9.6, 2, 7.1, 3.1, STEEL[5]);
  dither(g, 2, 4, 16, 2, STEEL[3], 1);
  ell(g, 9.2, 1.5, 5.6, 2, STEEL[6]);
  ell(g, 8.6, 1, 3.4, 0.9, STEEL[7]);
  box(g, 5, 0.6, 1, 0.6, '#FFFFFF');
  // (the seam down it, riveted; a dent with its lit lip; scuffs)
  box(g, 12.5, -1.5, 0.5, 8, STEEL[2]); box(g, 13, -1.5, 0.4, 8, STEEL[7]);
  ell(g, 15.4, 3.6, 1.2, 0.7, STEEL[2]); box(g, 14.6, 2.8, 1.4, 0.4, STEEL[7]);
  box(g, 4.2, 3.8, 2, 0.4, STEEL[2]); box(g, 6.6, 4.4, 1.4, 0.4, STEEL[2]); box(g, 10.5, 5, 1.6, 0.4, STEEL[2]);
  g.restore();
  rivet(g, 12.2, 0.2, STEEL[1], STEEL[7]); rivet(g, 12.2, 4, STEEL[1], STEEL[6]);
  // (a strip of tape slapped over a crack, under the seam)
  box(g, 14, -0.6, 2.4, 2.2, INK); box(g, 14.2, -0.4, 2, 1.8, '#B8BEC6'); box(g, 14.2, -0.4, 2, 0.5, '#E5E7EB');
  // (the barrel: a stepped tube, the coil seats dark (the coils themselves glow live), a collar either end)
  box(g, 15.5, 0.5, 7, 4, INK);
  box(g, 16, 1, 6, 3, STEEL[3]); box(g, 16, 1, 6, 0.7, STEEL[5]); box(g, 16, 3.3, 6, 0.7, STEEL[1]);
  for (const cx of [17, 19.5]) { box(g, cx - 0.4, -0.4, 2.3, 5.8, INK); box(g, cx, 0, 1.5, 5, '#500724'); }
  // (the dish at the muzzle: a ring, lit on top, dark round the back of it)
  box(g, 21.5, -1.5, 3, 8, INK);
  box(g, 22, -1, 2, 7, STEEL[4]); box(g, 22, -1, 2, 1, STEEL[6]); box(g, 22, 5, 2, 1, STEEL[2]); box(g, 22, -1, 0.6, 7, STEEL[5]);
  box(g, 23.5, 0.6, 1, 3.8, '#500724');
  // (the grip: duct tape round and round, a frayed end hanging off the bottom)
  box(g, 3.5, 4.5, 5, 5, INK);
  tape(g, 4, 5, 4, 4, 3);
  box(g, 4, 6.5, 4, 0.5, '#6B7280'); box(g, 4, 8, 4, 0.5, '#6B7280');
  poly(g, [[4, 9], [5.5, 9], [4.6, 10.4]], '#9CA3AF'); box(g, 4.4, 9.6, 0.6, 0.6, '#E5E7EB');
  // (the fin: inked, a lit leading edge, a rivet at its root)
  poly(g, [[3.4, -0.6], [8.3, -3.6], [9.6, 0.4]], INK);
  poly(g, [[4, -1], [8, -3], [9, 0]], STEEL[3]);
  poly(g, [[4.6, -1.1], [7.8, -2.6], [8.1, -1.8]], STEEL[5]);
  box(g, 7.5, -2.6, 0.6, 0.6, STEEL[7]);
};

/** The ray gun: grip at the origin, muzzle at (25, 2.5). */
export const drawRayGunHeld = (c: Ctx, frame: number) => {
  c.save();
  snapOrigin(c);
  heldStamp(c, 'raygun', 2, -5, 25, 17, paint);
  // The coils: glowing, pulsing, a bloom round them at the peak
  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.2), hot = pulse > 0.85;
  for (const cx of [17, 19.5]) {
    c.fillStyle = `rgba(244, 114, 182, ${pulse.toFixed(2)})`; c.fillRect(cx, 0, 1.5, 5);
    c.fillStyle = `rgba(253, 242, 248, ${(pulse * 0.8).toFixed(2)})`; c.fillRect(cx, 0.5, 0.6, 4);
    for (let y = 1; y < 5; y += 1.5) { c.fillStyle = 'rgba(80, 7, 36, 0.55)'; c.fillRect(cx, y, 1.5, 0.4); }
    if (hot) { c.fillStyle = 'rgba(244, 114, 182, 0.25)'; c.fillRect(cx - 1, -1, 3.5, 7); }
  }
  // (the emitter in the dish)
  c.fillStyle = hot ? '#FDF2F8' : '#F9A8D4'; c.fillRect(23.5, 1, 1, 3);
  c.fillStyle = `rgba(244, 114, 182, ${(0.15 + pulse * 0.2).toFixed(2)})`; c.fillRect(24.5, 0, 1, 5);
  // (now and then a spark jumps the coils)
  const sp = frame % 97;
  if (sp < 4) {
    c.strokeStyle = sp & 1 ? '#FFFFFF' : '#F9A8D4'; c.lineWidth = 0.6;
    c.beginPath(); c.moveTo(18.5, sp < 2 ? 0.5 : 4.5); c.lineTo(19, 2.5 + (sp - 1.5)); c.lineTo(18.6, 3); c.lineTo(19.5, sp < 2 ? 4 : 1); c.stroke();
  }
  glint(c, frame, 4, 13, 0, 2);
  twinkle(c, frame, 8.6, 1, 180, 40, 1.8);
  c.restore();
};
