// Artie's cryo-vault: a riveted steel room frosted over from the corners in, the great round vault door at the
// back, his specimens in tubes either side of it (the lobbyist and peer reviewer #2 among them), coolant lines along
// the ceiling grown over with icicles, his laminated trail map on the wall, the temperature readout, cold mist
// rolling along an iced-over floor.

import { bandedGradient, checker, steppedGlow, pixelBlob, hazeBands } from '../../pixelArt';
import { Ctx, hash, box, bevel, label, frame as picture } from './kit';
import { lite, dark } from '../../npc/kit';
import { mix } from '../../backdrops/core';
import { TUBE_BREAK_AT } from '../../../bosses/artie';

/** A pixel icicle: three tones, stepping in to a point. */
const icicle = (ctx: Ctx, x: number, y: number, len: number, wid: number) => {
  for (let i = 0; i < len; i += 2) {
    const half = Math.max(1, Math.round(wid * (1 - i / len)));
    box(ctx, x - half, y + i, half * 2, 2, i < len * 0.5 ? '#9ED4F0' : '#CFEFFF');
    box(ctx, x - half, y + i, 1, 2, '#FFFFFF');
    box(ctx, x + half - 1, y + i, 1, 2, '#5FA8D3');
  }
};

/** A part of a specimen: x, y, w, h (from its middle), its color; `flat` for no lit edge and shade. */
type Part = [number, number, number, number, string, boolean?];
const SPEC_INK = '#0B1220';
/** The parts, inked as one shape first (each a pixel out), then each filled, lit down its left and top, shaded down its right. */
const parts = (ctx: Ctx, mx: number, my: number, list: Part[], tint: (c: string) => string) => {
  for (const [x, y, w, h] of list) box(ctx, mx + x - 1, my + y - 1, w + 2, h + 2, SPEC_INK);
  for (const [x, y, w, h, c, flat] of list) {
    box(ctx, mx + x, my + y, w, h, tint(c));
    if (flat || w < 3 || h < 3) continue;
    box(ctx, mx + x, my + y, 1, h, tint(lite(c, 0.22))); box(ctx, mx + x, my + y, w, 1, tint(lite(c, 0.3)));
    box(ctx, mx + x + w - Math.max(1, Math.round(w / 4)), my + y + 1, Math.max(1, Math.round(w / 4)), h - 1, tint(dark(c, 0.25)));
  }
};

/**
 * What's in a tube: a mammoth calf (shaggy, tusks, the trunk curled), an emperor penguin, the lobbyist (navy suit, red
 * tie, slicked hair, briefcase), reviewer #2 (tweed, glasses, beard, the paper marked REJECT, the red pen). All of them
 * frozen mid-whatever, eyes open. `mode` 'tube': in the coolant (the tint goes over it after); 'out': tipped out onto the
 * floor, frosted over. Standing at (mx, my), its middle.
 */
const specimen = (ctx: Ctx, mx: number, my: number, what: number, mode: 'tube' | 'out') => {
  const tint = mode === 'out' ? (c: string) => mix(c, '#CFE8F7', 0.4) : (c: string) => c;
  const SKIN = '#E2C6A8', SKIN_D = '#B99878';
  if (what === 0) {
    // The mammoth calf, side on, facing left: legs, the shaggy body, the hump, the head, ear, the trunk curled, tusks
    const FUR = '#7A5A3C', FUR_D = '#5C4229';
    parts(ctx, mx, my, [
      [-14, 6, 6, 16, FUR_D], [-4, 6, 6, 16, FUR], [4, 6, 6, 16, FUR_D], [12, 6, 6, 16, FUR],
      [-18, -14, 38, 22, FUR], [-24, -24, 16, 14, FUR], [-28, -18, 14, 16, FUR],
      [-31, -6, 5, 10, FUR], [-33, 3, 5, 6, FUR_D], [-31, 8, 4, 3, FUR_D], [18, -10, 3, 8, FUR_D],
    ], tint);
    // (the shag hanging off its belly and legs, the ear, the eye, the tusks)
    for (let k = 0; k < 9; k++) box(ctx, mx - 16 + k * 4, my + 6, 2, 3 + (k % 3), tint(FUR_D));
    for (let k = 0; k < 5; k++) box(ctx, mx - 12 + k * 7, my - 12, 1, 6, tint(lite(FUR, 0.2)));
    box(ctx, mx - 18, my - 16, 5, 8, tint(dark(FUR, 0.35)));
    box(ctx, mx - 25, my - 13, 2, 2, SPEC_INK); box(ctx, mx - 25, my - 13, 1, 1, '#FFFFFF');
    for (const [tx, ty] of [[-27, -2], [-28, 1], [-29, 3], [-28, 5]] as const) box(ctx, mx + tx, my + ty, 3, 2, tint('#F2EAD3'));
    box(ctx, mx - 28, my + 5, 2, 1, tint('#FFFFFF'));
  } else if (what === 1) {
    // The emperor penguin: the black back, the white front, the yellow at the neck, the beak, flippers out, the feet
    const BL = '#1F2430';
    parts(ctx, mx, my, [
      [-8, 14, 6, 3, '#F59E0B', true], [2, 14, 6, 3, '#F59E0B', true],
      [-13, -14, 4, 20, BL], [9, -14, 4, 20, BL],
      [-9, -24, 18, 38, BL], [-7, -34, 14, 12, BL], [6, -29, 7, 3, '#E58A0B'],
    ], tint);
    box(ctx, mx - 6, my - 18, 12, 30, tint('#EEF2F5')); box(ctx, mx - 6, my - 18, 3, 30, tint('#FFFFFF')); box(ctx, mx + 3, my - 16, 3, 28, tint('#C9D3DC'));
    box(ctx, mx - 6, my - 24, 12, 6, tint('#FCD34D')); box(ctx, mx - 6, my - 24, 12, 2, tint('#FDE68A'));
    box(ctx, mx + 2, my - 31, 3, 3, tint('#FFFFFF')); box(ctx, mx + 3, my - 30, 1, 1, SPEC_INK);
    box(ctx, mx + 6, my - 27, 7, 1, tint('#B45309'));
  } else {
    // A man stood stiff: shoes, trousers, the jacket, shirt and tie (or the vest), arms, hands, the head
    const lobby = what === 2;
    const SUIT = lobby ? '#2B3A5C' : '#7C5E3C', PANTS = lobby ? '#27324A' : '#8C7B5E';
    parts(ctx, mx, my, [
      [-10, 24, 9, 3, '#14141A', true], [1, 24, 9, 3, '#14141A', true],
      [-9, 4, 8, 20, PANTS], [1, 4, 8, 20, PANTS],
      [-15, -18, 5, 21, SUIT], [10, -18, 5, 21, SUIT],
      [-11, -20, 22, 27, SUIT],
      [-15, 3, 5, 4, SKIN, true], [10, 3, 5, 4, SKIN, true],
      [-6, -34, 12, 14, SKIN],
    ], tint);
    // (the shirt in the V of the jacket, the lapels)
    box(ctx, mx - 3, my - 20, 6, 10, tint('#E8EEF5'));
    box(ctx, mx - 6, my - 20, 3, 8, tint(lite(SUIT, 0.15))); box(ctx, mx + 3, my - 20, 3, 8, tint(dark(SUIT, 0.15)));
    if (lobby) {
      box(ctx, mx - 2, my - 20, 4, 2, tint('#DC2626')); box(ctx, mx - 1, my - 18, 2, 12, tint('#B91C1C')); box(ctx, mx - 1, my - 18, 1, 12, tint('#EF4444'));
      // the briefcase in his hand, a gold clasp, a dollar sticker
      parts(ctx, mx, my, [[12, 6, 14, 10, '#5B3A1E']], tint);
      box(ctx, mx + 16, my + 4, 6, 2, tint('#3A2412')); box(ctx, mx + 18, my + 8, 2, 2, tint('#FACC15')); box(ctx, mx + 21, my + 11, 3, 3, tint('#22C55E'));
      // slicked hair, a part; a lapel pin
      box(ctx, mx - 6, my - 36, 12, 4, tint('#2A1A10')); box(ctx, mx - 6, my - 33, 2, 3, tint('#2A1A10')); box(ctx, mx - 2, my - 36, 1, 3, tint('#5A3A20'));
      box(ctx, mx - 7, my - 15, 2, 2, tint('#FACC15'));
    } else {
      // the sweater vest, elbow patches, a bald dome with the ring of grey round it, a beard; the paper and the pen
      box(ctx, mx - 3, my - 12, 6, 12, tint('#4D6B3C')); for (let k = 0; k < 4; k++) box(ctx, mx - 3 + (k % 2) * 3, my - 12 + k * 3, 2, 1, tint('#5E7D4B'));
      for (let yy = -18; yy < 6; yy += 3) for (let xx = -10; xx < 10; xx += 4) box(ctx, mx + xx + ((yy / 3) % 2 ? 2 : 0), my + yy, 1, 1, tint(dark(SUIT, 0.3)));
      box(ctx, mx - 15, my - 6, 4, 4, tint('#5C3F22')); box(ctx, mx + 11, my - 6, 4, 4, tint('#5C3F22'));
      box(ctx, mx - 7, my - 30, 2, 6, tint('#B8B8B8')); box(ctx, mx + 5, my - 30, 2, 6, tint('#B8B8B8'));
      box(ctx, mx - 5, my - 24, 10, 5, tint('#C8C8C8')); box(ctx, mx - 4, my - 20, 8, 2, tint('#A8A8A8'));
      parts(ctx, mx, my, [[-26, -2, 12, 15, '#F8FAFC']], tint);
      for (let k = 0; k < 4; k++) box(ctx, mx - 24, my + 1 + k * 3, 8, 1, tint('#94A3B8'));
      box(ctx, mx - 24, my + 2, 8, 1, tint('#DC2626')); box(ctx, mx - 22, my + 6, 5, 5, tint('#E11D48'));
      box(ctx, mx + 13, my - 2, 2, 8, tint('#DC2626')); box(ctx, mx + 13, my - 3, 2, 1, tint('#FCA5A5'));
    }
    // The face, frozen: eyes wide (the glasses for #2), brows up, the mouth open in an O
    if (!lobby) { box(ctx, mx - 5, my - 30, 4, 3, SPEC_INK); box(ctx, mx + 1, my - 30, 4, 3, SPEC_INK); box(ctx, mx - 4, my - 29, 2, 1, tint('#BFE3F5')); box(ctx, mx + 2, my - 29, 2, 1, tint('#BFE3F5')); box(ctx, mx - 1, my - 29, 2, 1, SPEC_INK); }
    else { box(ctx, mx - 4, my - 29, 2, 2, '#FFFFFF'); box(ctx, mx + 2, my - 29, 2, 2, '#FFFFFF'); box(ctx, mx - 3, my - 28, 1, 1, SPEC_INK); box(ctx, mx + 3, my - 28, 1, 1, SPEC_INK); box(ctx, mx - 4, my - 32, 3, 1, tint('#2A1A10')); box(ctx, mx + 2, my - 32, 3, 1, tint('#2A1A10')); }
    box(ctx, mx, my - 27, 1, 2, tint(SKIN_D));
    box(ctx, mx - 1, my - 24, 3, 3, '#4A1A1A');
  }
};

/** Cracks spreading over a tube's glass (k 0..1: how far they've got), out from a point on it. */
const cracks = (ctx: Ctx, x: number, y: number, w: number, h: number, k: number, seed: number) => {
  if (k <= 0) return;
  const ox = x + w * (0.3 + hash(seed) * 0.4), oy = y + h * (0.25 + hash(seed + 1) * 0.4);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.strokeStyle = 'rgba(235, 250, 255, 0.85)'; ctx.lineWidth = 1;
  const n = Math.ceil(k * 7);
  for (let i = 0; i < n; i++) {
    const a = (i / 7) * Math.PI * 2 + hash(seed + i * 3) * 0.6, len = (14 + hash(seed + i * 5) * 40) * Math.min(1, k * 1.6);
    ctx.beginPath(); ctx.moveTo(ox, oy);
    for (let j = 1; j <= 4; j++) {
      const px = ox + Math.cos(a + (hash(seed + i * 7 + j) - 0.5) * 0.7) * len * j / 4, py = oy + Math.sin(a + (hash(seed + i * 9 + j) - 0.5) * 0.7) * len * j / 4;
      ctx.lineTo(Math.round(px) + 0.5, Math.round(py) + 0.5);
    }
    ctx.stroke();
  }
  box(ctx, ox - 1, oy - 1, 3, 3, 'rgba(255, 255, 255, 0.9)');
  ctx.restore();
};

/** A row of broken glass teeth along y, pointing down (dir 1) or up (dir -1). */
const teeth = (ctx: Ctx, x: number, y: number, w: number, dir: number, seed: number) => {
  for (let i = 0; i < w; i += 6) {
    const hgt = 4 + Math.round(hash(seed + i) * 14);
    for (let j = 0; j < hgt; j += 2) {
      const half = Math.max(1, Math.round(3 * (1 - j / hgt)));
      box(ctx, x + i + 3 - half, y + dir * j - (dir < 0 ? 2 : 0), half * 2, 2, j < 2 ? '#7FB8DC' : 'rgba(207, 239, 255, 0.75)');
    }
  }
};

/**
 * One of his specimen tubes: steel caps, glass, blue coolant with bubbles coming up, and what's in it. As the vault
 * warms, `crack` (0..1) spreads over the glass; `broke` (frames since it gave, or -1): it's gone, teeth of glass left in
 * the caps, the last of the coolant dripping out of the pipe, and what was in it is out on the floor (drawn there).
 */
const tube = (ctx: Ctx, cx: number, top: number, bottom: number, what: number, name: string, f: number, crack = 0, broke = -1) => {
  const w = 54, x = cx - w / 2;
  // Coolant pipe up to the ceiling
  box(ctx, cx - 4, top - 80, 8, 80, '#24415E'); box(ctx, cx - 4, top - 80, 2, 80, '#3E6688');
  bevel(ctx, x - 4, top - 14, w + 8, 14, '#3A5670', '#6B8BA8', '#1C2E40');
  bevel(ctx, x - 6, bottom - 24, w + 12, 24, '#3A5670', '#6B8BA8', '#1C2E40');
  const gy = top, gh = bottom - 24 - top;
  if (broke >= 0) {
    box(ctx, x, gy, w, gh, 'rgba(6, 14, 24, 0.35)');
    teeth(ctx, x, gy, w, 1, what * 11);
    teeth(ctx, x, gy + gh, w, -1, what * 13 + 5);
    const every = broke < 240 ? 9 : 40;
    for (let k = 0; k < 3; k++) {
      const q = ((f + k * 17 + what * 7) % every) / every;
      if (broke < 240 || k === 0) box(ctx, cx - 6 + k * 6, gy + q * gh, 2, 4, '#5FA8D3');
    }
    box(ctx, cx - 28, bottom - 18, 56, 10, '#D8E6F0'); label(ctx, name, cx, bottom - 10.5, '#1C2E40', 5);
    return;
  }
  // The liquid, banded darker to the bottom
  bandedGradient(ctx, x, gy, w, gh, ['#1E6E9E', '#175A86', '#12476C'], 6);
  // What's in it (a dark shape through the blue)
  // (bobbing very slightly in it)
  ctx.save(); ctx.beginPath(); ctx.rect(x, gy, w, gh); ctx.clip();
  specimen(ctx, cx + (what === 0 ? 6 : 0), Math.round(gy + gh * 0.55 + Math.sin(f * 0.03 + what) * 2), what, 'tube');
  ctx.restore();
  // The coolant over it: blue, banded deeper down, so it's in there, not in front
  hazeBands(ctx, x, gy, w, gh, '#1E6E9E', 0.18, 0.4, 6);
  // Bubbles coming up (boiling up, the hotter it's got)
  for (let k = 0; k < 5 + Math.round(crack * 10); k++) {
    const life = (f * (0.6 + (k % 3) * 0.25) + k * 37 + what * 13) % gh;
    const bx = x + 8 + hash(k + what * 7) * (w - 16) + Math.sin((f + k * 20) * 0.08) * 2;
    box(ctx, bx, gy + gh - life, 2 + (k % 2), 2 + (k % 2), 'rgba(200, 240, 255, 0.7)');
  }
  // Frost up the glass from the bottom, the glass's shine, the edges
  checker(ctx, x, gy + gh - 18, w, 18, 'rgba(230, 245, 255, 0.45)', 0);
  box(ctx, x + 6, gy, 4, gh, 'rgba(255, 255, 255, 0.22)'); box(ctx, x + 12, gy, 2, gh, 'rgba(255, 255, 255, 0.12)');
  box(ctx, x, gy, 2, gh, '#7FB8DC'); box(ctx, x + w - 2, gy, 2, gh, '#0E3550');
  cracks(ctx, x, gy, w, gh, crack, what * 29 + 3);
  // The plate on the base
  box(ctx, cx - 28, bottom - 18, 56, 10, '#D8E6F0'); label(ctx, name, cx, bottom - 10.5, '#1C2E40', 5);
};

/** How hot it's got, as the readout shows it (degrees C). */
const tempOf = (heat: number) => Math.round(-89 + heat * 131);
/** The mercury: blue cold, up through yellow, red hot. */
const mercury = (heat: number) => heat < 0.45 ? '#5DADE2' : heat < 0.75 ? '#FACC15' : '#EF4444';

/**
 * His vault. `vault` (see GameState.artieVault): how hot it's got (0..1) and when each tube gave. Fire in here warms it
 * for good: the frost goes off the walls, the icicles on the coolant lines shrink and drip, the floor ice goes to
 * water, the mist to steam, the coolant cores in the columns run hot, the readout and its gauge climb, and the
 * specimen tubes crack and give.
 */
export const drawArtieLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number, vault?: { heat: number; broke: number[] }) => {
  const W = R - L;
  const heat = vault?.heat ?? 0, cold = 1 - heat;
  // The wall: cold steel, banded darker up into the gloom
  bandedGradient(ctx, L, T, W, B - T, ['#0A1626', '#0F2236', '#16304A', '#1A3956', '#16314B'], 14);
  // (warming: a glow coming up the steel off the floor, in bands)
  if (heat > 0.05) hazeBands(ctx, L, T + (B - T) * 0.35, W, (B - T) * 0.65, '#FF6A1E', 0, heat * 0.36, 6);
  // Riveted panels
  for (let y = T + 24, row = 0; y < B - 20; y += 86, row++) {
    for (let x = L + 24 - (row % 2) * 60; x < R - 24; x += 120) {
      const x0 = Math.max(L + 24, x), x1 = Math.min(R - 24, x + 120);
      box(ctx, x0, y, x1 - x0, 2, '#081320'); box(ctx, x0, y + 2, x1 - x0, 1, '#28507A');
      box(ctx, x1 - 2, y, 2, 86, '#081320'); box(ctx, x1, y, 1, 86, '#28507A');
      for (const rx of [x0 + 6, x1 - 8]) for (const ry of [y + 6, y + 78]) { box(ctx, rx, ry, 2, 2, '#4C7BA6'); box(ctx, rx + 1, ry + 1, 1, 1, '#0A1626'); }
    }
  }
  // Frost creeping in off the ceiling and up off the floor: ragged, dithered at the edge (going as it warms)
  if (cold > 0.02) {
    box(ctx, L, T + 18, W, 30, `rgba(210, 236, 255, ${(0.12 * cold).toFixed(3)})`);
    checker(ctx, L, T + 48, W, Math.round(14 * cold), `rgba(210, 236, 255, ${(0.12 * cold).toFixed(3)})`, 1);
    box(ctx, L, B - 40, W, 26, `rgba(210, 236, 255, ${(0.10 * cold).toFixed(3)})`);
    checker(ctx, L, B - 56, W, Math.round(16 * cold), `rgba(210, 236, 255, ${(0.10 * cold).toFixed(3)})`, 0);
  }
  // (and the meltwater running down the panels)
  if (heat > 0.15) for (let i = 0; i < 18; i++) {
    const x = Math.round(L + 30 + hash(i + 70) * (W - 60)), len = Math.round((30 + hash(i + 90) * 120) * Math.min(1, (heat - 0.15) * 2));
    box(ctx, x, T + 50, 1, len, 'rgba(160, 210, 240, 0.35)');
    box(ctx, x, T + 50 + ((f * (0.6 + hash(i) * 0.6) + i * 40) % Math.max(1, len)), 1, 3, 'rgba(220, 245, 255, 0.7)');
  }

  // The vault door, centre back: a great round slab, bolted, a handwheel, frost round the bottom of it
  const cx = L + W / 2, cy = T + 190;
  steppedGlow(ctx, cx, cy, 150, '#5DADE2', 0.10, 0.0, 5);
  ctx.fillStyle = '#1C2E40'; ctx.beginPath(); ctx.arc(cx, cy, 112, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3A5670'; ctx.beginPath(); ctx.arc(cx, cy, 104, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4E6E8C'; ctx.beginPath(); ctx.arc(cx - 4, cy - 4, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#41607C'; ctx.beginPath(); ctx.arc(cx, cy, 86, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const bx = cx + Math.cos(a) * 97, by = cy + Math.sin(a) * 97;
    box(ctx, bx - 3, by - 3, 6, 6, '#26405A'); box(ctx, bx - 3, by - 3, 3, 3, '#8FB3D0');
  }
  // the handwheel
  ctx.strokeStyle = '#1C2E40'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#9DB9D2'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 34, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.3;
    ctx.strokeStyle = '#1C2E40'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34); ctx.stroke();
  }
  box(ctx, cx - 8, cy - 8, 16, 16, '#26405A'); box(ctx, cx - 8, cy - 8, 8, 4, '#8FB3D0');
  label(ctx, 'CRYO-VAULT 1', cx, cy - 58, '#BFD9EE', 6);
  // frost across the bottom of the door
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 104, 0, Math.PI * 2); ctx.clip();
  if (cold > 0.02) {
    const fr = Math.round(cold * 30);
    checker(ctx, cx - 110, cy + 70 - fr, 220, fr, `rgba(235, 248, 255, ${(0.5 * cold).toFixed(3)})`, 0);
    box(ctx, cx - 110, cy + 70 + Math.round(heat * 40), 220, 60, `rgba(235, 248, 255, ${(0.35 * cold).toFixed(3)})`);
  }
  ctx.restore();

  // Specimens either side of it
  const tubeTop = B - 200;
  const TUBES: [number, number, string][] = [[L + 100, tubeTop, 'MAMMOTH'], [L + 190, tubeTop + 20, 'PENGUIN'], [R - 190, tubeTop + 20, 'LOBBYIST'], [R - 100, tubeTop, 'REVIEWER 2']];
  TUBES.forEach(([tx0, top, name], i) => {
    const broke = vault && vault.broke[i] >= 0 ? f - vault.broke[i] : -1;
    // (it starts to go a little before it gives)
    const crack = Math.max(0, Math.min(1, (heat - (TUBE_BREAK_AT[i] - 0.14)) / 0.14));
    tube(ctx, tx0, top, B - 14, i, name, f, crack, broke);
  });

  // His laminated trail map, every crevasse on it, pinned up top left; the readout top right
  picture(ctx, L + 52, T + 60, 90, 62, '#D8E6F0', '#FFFFFF', () => {
    box(ctx, L + 52, T + 60, 90, 62, '#EEF4F7');
    ctx.strokeStyle = '#7FA7C4'; ctx.lineWidth = 1;
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(L + 52, T + 70 + k * 11); for (let x = 0; x <= 90; x += 10) ctx.lineTo(L + 52 + x, T + 70 + k * 11 + Math.sin(x * 0.1 + k) * 4); ctx.stroke(); }
    ctx.strokeStyle = '#B45309'; ctx.beginPath(); ctx.moveTo(L + 58, T + 116); ctx.lineTo(L + 80, T + 96); ctx.lineTo(L + 100, T + 100); ctx.lineTo(L + 132, T + 68); ctx.stroke();
    for (let k = 0; k < 7; k++) { const x = L + 60 + hash(k + 40) * 74, y = T + 66 + hash(k + 60) * 50; box(ctx, x, y, 3, 1, '#DC2626'); box(ctx, x + 1, y - 1, 1, 3, '#DC2626'); }
  });
  box(ctx, L + 95, T + 54, 4, 4, '#DC2626');
  const tx = R - 150, ty = T + 62;
  bevel(ctx, tx, ty, 96, 40, '#0B1B2B', '#3E6688', '#06101A');
  // (above freezing, it's flashing: it was never meant to get there)
  const temp = tempOf(heat), alarm = temp > 0 && f % 30 < 15;
  label(ctx, alarm ? 'WARNING' : 'VAULT TEMP', tx + 48, ty + 13, alarm ? '#EF4444' : '#5DADE2', 5);
  label(ctx, `${temp > 0 ? '+' : ''}${temp}${f % 60 < 50 ? '°' : ' '}C`, tx + 48, ty + 31, temp < -30 ? '#7DF9FF' : temp <= 0 ? '#FDE047' : '#F87171', 10);
  // The gauge beside it: a big thermometer, the mercury climbing, freezing marked on it
  const gx = tx - 26, gTop = ty - 8, gBot = ty + 96, run = gBot - gTop - 18;
  const level = (h: number) => gBot - 10 - Math.round(run * (0.08 + h * 0.92));
  bevel(ctx, gx - 2, gTop - 2, 16, gBot - gTop + 4, '#0B1B2B', '#3E6688', '#06101A');
  box(ctx, gx + 4, gTop + 4, 4, gBot - gTop - 14, '#06101A');
  const mTop = level(heat);
  box(ctx, gx + 4, mTop, 4, gBot - 10 - mTop, mercury(heat)); box(ctx, gx + 4, mTop, 1, gBot - 10 - mTop, 'rgba(255, 255, 255, 0.5)');
  ctx.fillStyle = mercury(heat); ctx.beginPath(); ctx.arc(gx + 6, gBot - 6, 6, 0, Math.PI * 2); ctx.fill();
  box(ctx, gx + 4, gBot - 9, 2, 2, 'rgba(255, 255, 255, 0.6)');
  for (let k = 0; k <= 6; k++) box(ctx, gx + 9, Math.round(gTop + 6 + k * (gBot - gTop - 22) / 6), 3, 1, '#6B8BA8');
  box(ctx, gx + 8, level(89 / 131), 6, 1, '#FDE047');

  // Coolant lines along the ceiling, with icicles grown off them
  for (const [y, h] of [[T + 18, 12], [T + 34, 8]] as const) {
    box(ctx, L, y, W, h, '#2C4A66'); box(ctx, L, y, W, 2, '#6B8BA8'); box(ctx, L, y + h - 2, W, 2, '#152638');
    for (let x = L + 40; x < R; x += 96) bevel(ctx, x, y - 2, 10, h + 4, '#3A5A78', '#8FB3D0', '#152638', 1);
    checker(ctx, L, y, W, 4, 'rgba(235, 248, 255, 0.5)', 0);
  }
  for (let i = 0; i < 34; i++) {
    const x = L + 10 + i * (W - 20) / 33 + (hash(i) - 0.5) * 8;
    // (shrinking as it warms, dripping off the tip)
    const len = Math.round((8 + hash(i + 5) * 22) * (1 - heat * 0.8));
    if (len >= 2) icicle(ctx, x, T + 42, len, 2 + Math.round(hash(i + 9) * 3));
    if (heat > 0.1 && hash(i + 33) < heat) { const q = ((f * 1.3 + i * 23) % 90) / 90; box(ctx, Math.round(x), Math.round(T + 42 + len + q * (B - 14 - T - 42 - len)), 1, 3, 'rgba(190, 230, 255, 0.8)'); }
  }

  // The side columns: frosted steel, a coolant core lit inside
  for (const x of [L, R - 24]) {
    bevel(ctx, x, T, 24, B - T, '#13283C', '#34587A', '#081420');
    // (the cores run hot as it warms: cyan, then amber, then red and stuttering)
    const pulse = heat > 0.75 ? (f % 9 < 3 ? 0.25 : 0.85) : 0.5 + 0.3 * Math.sin(f * (0.08 + heat * 0.2));
    const core = heat < 0.45 ? '125, 249, 255' : heat < 0.75 ? '251, 191, 36' : '248, 80, 60';
    box(ctx, x + 8, T + 24, 8, B - T - 48, heat < 0.45 ? '#0A3A4A' : '#3A1A0A');
    box(ctx, x + 10, T + 24, 4, B - T - 48, `rgba(${core}, ${pulse.toFixed(2)})`);
    for (let y = T + 40; y < B - 30; y += 50) { box(ctx, x + 4, y, 16, 3, '#34587A'); if (cold > 0.05) checker(ctx, x, y + 3, 24, Math.round(6 * cold), `rgba(235, 248, 255, ${(0.4 * cold).toFixed(3)})`, 0); }
  }

  // The floor: iced-over plate, a shine along it, frost at the seams
  box(ctx, L, B - 14, W, 14, '#16324C');
  box(ctx, L, B - 14, W, 2, heat > 0.5 ? '#5FA8D3' : '#9ED4F0');
  for (let x = L; x < R; x += 60) { box(ctx, x, B - 12, 2, 12, '#0B1B2B'); if (cold > 0.05) checker(ctx, x - 4, B - 12, 10, Math.max(1, Math.round(4 * cold)), `rgba(235, 248, 255, ${(0.6 * cold).toFixed(3)})`, 0); }
  for (let x = L + 20; x < R; x += 140) box(ctx, x + (f * 0.2) % 40, B - 10, 18, 1, 'rgba(255, 255, 255, 0.5)');
  // (meltwater standing on it, drips landing in it)
  if (heat > 0.2) {
    const a = Math.min(1, (heat - 0.2) * 1.6);
    for (let k = 0; k < 9; k++) {
      const px = Math.round(L + 40 + hash(k + 120) * (W - 120)), pw = Math.round((40 + hash(k + 130) * 90) * a);
      box(ctx, px, B - 14, pw, 2, 'rgba(70, 150, 200, 0.7)');
      box(ctx, px + 4, B - 14, Math.max(0, pw - 8), 1, 'rgba(200, 235, 255, 0.6)');
      if ((f + k * 13) % 50 < 6 && pw > 12) box(ctx, px + ((f + k * 13) % 50) * 2 % pw, B - 15, 2, 1, 'rgba(255, 255, 255, 0.8)');
    }
  }
  // The tubes that gave: their coolant out across the floor, and what was in them out of it, face down in it, frosted
  TUBES.forEach(([tx0], i) => {
    if (!vault || vault.broke[i] < 0) return;
    const t = f - vault.broke[i], spread = Math.min(1, t / 50);
    box(ctx, Math.round(tx0 - 60 * spread), B - 14, Math.round(120 * spread), 2, '#1E6E9E');
    box(ctx, Math.round(tx0 - 54 * spread), B - 14, Math.round(108 * spread), 1, '#7FB8DC');
    const tip = Math.min(1, t / 14);
    const dir = i < 2 ? 1 : -1;
    ctx.save(); ctx.translate(tx0 + dir * 30, B - 15); ctx.rotate(dir * tip * Math.PI / 2);
    specimen(ctx, 0, i === 0 ? -22 : i === 1 ? -17 : -27, i, 'out');
    ctx.restore();
    if (t < 400 && (f + i * 7) % 24 < 12) pixelBlob(ctx, tx0 + Math.sin(f * 0.05 + i) * 20, B - 30 - (t % 60) * 0.3, 40, 10, 'rgba(220, 240, 255, 0.12)');
  });

  // Cold mist rolling along the floor, and the odd flake hanging in the air
  for (let k = 0; k < 7; k++) {
    const mx = L + ((k * 131 + f * (0.25 + (k % 3) * 0.1)) % (W + 160)) - 80;
    // (lifting off the floor as steam, the warmer it gets)
    const rise = heat > 0.3 ? ((f * (0.3 + (k % 3) * 0.15) + k * 40) % 140) * (heat - 0.3) / 0.7 : 0;
    pixelBlob(ctx, mx, B - 22 - (k % 3) * 6 - rise, 60 + (k % 2) * 30, 10, `rgba(220, 240, 255, ${(0.10 + heat * 0.06).toFixed(3)})`);
  }
  for (let i = 0; i < Math.round(22 * cold); i++) {
    const sx = L + ((i * 37 + Math.sin(f * 0.03 + i) * 20 + f * 0.3) % W);
    const sy = T + ((i * 47 + f * (0.4 + (i % 3) * 0.2)) % (B - T));
    box(ctx, sx, sy, 2, 2, 'rgba(235, 245, 251, 0.6)');
  }
};
