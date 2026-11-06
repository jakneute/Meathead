// HELICOPTER HARRY's refight (WRATH): Foreign Lands' own crash site and boss fight (foreign/harry) run whole at 999, in
// hell: Ned's knockoff of the AMERICA pavilion's construction site. Harry died screaming and shooting at everything, and
// he's been doing it down here since; the STATUE OF LIBERTY's raised with him (the owner: "harry's also includes how
// the statue died and how it is stitched together. it looks janky and creepy. that's the other visual flourish of the
// harry fight"):
//   - her, by how she went (refightOn().statue; the file's MEMO_CRUMBLED): SHOT HERSELF (most players' (the owner's
//     "for most players, it will probably be the gun variant"), so the one polished first: a terracotta flower pot
//     jammed in the hole she blew out of her head, dead stalks out of it, sewn in with cable; a button for her eye on that
//     side; her face seamed and stapled), or FELL APART (duct tape over every crack: across her face, round her neck,
//     over her shoulder; a cheek of plain gray concrete patched in where a chunk was lost), drawn over her own art in her
//     own frame (foreign/harry/liberty.ts LIB_HOOKS, set here, a no-op outside the refight);
//   - him, by how he died: SHOT BY HIS OWN ROUNDS (the holes sewn shut, a cross-stitch each), BURIED IN CEMENT (her
//     concrete still crusted on him in patches, his own art's crust kept on a little), PUKED TO DEATH (a seam across his
//     gut where Ned sewed a new stomach in, green round the gills, his own art's green kept on a little);
//   - the hell along the berm's top, low (skulls, bones, burning barrels, his wrath's leavings: a shot-up TV, a mailbox
//     full of holes), behind the slab (foreign/harry/scene.ts SCENE_HOOKS, a no-op outside the refight): the generic
//     props would stand in front of her and him, both drawn in the land's back;
//   - his lines swapped (park4/lines/foreign.ts; through heli/talk.ts harryPool, his pools' own picker).

import type { RefightDef } from '../defs';
import type { GameState } from '../../../../m1/game/core/state';
import { foreignLayout } from '../../../foreign/index';
import { keptForRevisits } from '../../../store';
import { MEMO_CRUMBLED, MEMO_DEATH, type Fight } from '../../../foreign/harry/fight';
import { LIB_HOOKS, gunLine, type LibLook } from '../../../foreign/harry/liberty';
import { SCENE_HOOKS } from '../../../foreign/harry/scene';
import { LIB, VIEW_X, BERM_Y, sy } from '../../../foreign/harry/arena';
import * as H from '../../../foreign/harry/lines';
import { stamp } from '../../../../m1/game/render/stamp';
import { inRefight, refightOn } from '../hook';
import { refightId, refightStage } from '../where';
import * as L from '../lines/foreign';

type Ctx = CanvasRenderingContext2D;
const on = () => inRefight('foreign');
const INK = '#120A08';

// ---------------------------------------------------------------------------------------------------------------
// Her, stitched up the way she went

/** A run of stitches along a line: the dark cut, then the thread crossed over it. */
const seamLine = (g: Ctx, x0: number, y0: number, x1: number, y1: number, thread: string, gap = 9, w = 6) => {
  const len = Math.hypot(x1 - x0, y1 - y0) || 1, n = Math.max(2, Math.floor(len / gap)), nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = '#2A0A06'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x0 + 1, y0 + 1); g.lineTo(x1 + 1, y1 + 1); g.stroke();
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x - nx * w, y - ny * w); g.lineTo(x + nx * w, y + ny * w); g.stroke();
    g.strokeStyle = thread; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - nx * w, y - ny * w); g.lineTo(x + nx * w, y + ny * w); g.stroke();
  }
};
const staple = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = INK; g.fillRect(-7, -2, 14, 4); g.fillStyle = '#C8C8D0'; g.fillRect(-6, -1, 12, 2); g.fillStyle = '#6A6A76'; g.fillRect(-6, -1, 2, 4); g.fillRect(4, -1, 2, 4);
  g.restore();
};
/** A strip of duct tape: silver, its edges torn, the weave showing, a shine down it. */
const tape = (g: Ctx, x: number, y: number, len: number, a: number, w = 16) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = INK; g.fillRect(-len / 2 - 1, -w / 2 - 1, len + 2, w + 2);
  g.fillStyle = '#8E9096'; g.fillRect(-len / 2, -w / 2, len, w);
  g.fillStyle = '#B8BAC0'; g.fillRect(-len / 2, -w / 2, len, 3);
  g.fillStyle = '#6A6C72'; g.fillRect(-len / 2, w / 2 - 3, len, 3);
  for (let i = -len / 2 + 3; i < len / 2; i += 4) { g.fillStyle = 'rgba(60, 62, 68, 0.35)'; g.fillRect(i, -w / 2 + 3, 1, w - 6); }
  // (torn ends: notches)
  g.fillStyle = INK; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) g.fillRect(s * len / 2 - (s > 0 ? 2 : 0), -w / 2 + 2 + k * (w / 3), 2, 2);
  g.restore();
};
/** The flower pot she's got where the side of her head was: terracotta, banded, dirt, dead stalks, cable through holes
 *  drilled round its rim and through her copper. (cx, cy) the hole's middle, `dir` out of it. */
const flowerPot = (g: Ctx, cx: number, cy: number, dir: { x: number; y: number }) => {
  const a = Math.atan2(dir.y, dir.x);
  g.save(); g.translate(cx, cy); g.rotate(a);
  // (the pot, on its side, its mouth out: a tapered body back into her head, the rim out here)
  const T = ['#5A2410', '#8A3A18', '#B8582A', '#D8804A', '#F0A878'];
  g.fillStyle = INK; g.beginPath(); g.moveTo(-34, -30); g.lineTo(22, -40); g.lineTo(22, 40); g.lineTo(-34, 30); g.closePath(); g.fill();
  g.fillStyle = T[2]; g.beginPath(); g.moveTo(-32, -27); g.lineTo(20, -37); g.lineTo(20, 37); g.lineTo(-32, 27); g.closePath(); g.fill();
  g.fillStyle = T[3]; g.beginPath(); g.moveTo(-32, -27); g.lineTo(20, -37); g.lineTo(20, -20); g.lineTo(-32, -14); g.closePath(); g.fill();
  g.fillStyle = T[1]; g.beginPath(); g.moveTo(-32, 16); g.lineTo(20, 22); g.lineTo(20, 37); g.lineTo(-32, 27); g.closePath(); g.fill();
  for (let y = -30; y < 30; y += 4) { g.fillStyle = T[1]; g.fillRect(-6 + ((y / 4) % 2) * 2, y, 2, 2); }
  // (the rim, out)
  g.fillStyle = INK; g.fillRect(18, -46, 18, 92);
  g.fillStyle = T[3]; g.fillRect(20, -44, 14, 88); g.fillStyle = T[4]; g.fillRect(20, -44, 14, 4); g.fillStyle = T[1]; g.fillRect(20, 36, 14, 8);
  // (a chip out of it, a crack)
  g.fillStyle = INK; g.beginPath(); g.moveTo(34, -10); g.lineTo(26, -4); g.lineTo(34, 4); g.closePath(); g.fill();
  g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(26, -4); g.lineTo(6, 2); g.lineTo(-4, -6); g.stroke();
  // (the dirt in its mouth, dead stalks out of it, a wilted bloom gone brown)
  g.fillStyle = '#2A1A10'; g.beginPath(); g.ellipse(36, 0, 4, 38, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = INK; g.lineWidth = 3;
  const stalks: [number, number, number, number][] = [[36, -12, 74, -30], [36, 4, 80, 10], [36, 16, 66, 40], [36, -24, 58, -52]];
  for (const [x0, y0, x1, y1] of stalks) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 6, (y0 + y1) / 2 - 8, x1, y1); g.stroke(); }
  g.strokeStyle = '#6B5A2A'; g.lineWidth = 1.4;
  for (const [x0, y0, x1, y1] of stalks) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 6, (y0 + y1) / 2 - 8, x1, y1); g.stroke(); }
  for (const [, , x1, y1] of stalks.slice(0, 2)) { g.fillStyle = INK; g.beginPath(); g.ellipse(x1, y1 + 5, 6, 8, 0.3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5A3A1A'; g.beginPath(); g.ellipse(x1, y1 + 5, 4.4, 6.4, 0.3, 0, Math.PI * 2); g.fill(); }
  g.restore();
  // (the cable lashing it in: through her copper and round the rim, twisted off)
  const rim = (k: number) => ({ x: cx + Math.cos(a) * 28 - Math.sin(a) * k, y: cy + Math.sin(a) * 28 + Math.cos(a) * k });
  for (const k of [-40, -14, 14, 40]) {
    const p = rim(k), q = { x: cx - Math.cos(a) * 48 - Math.sin(a) * k * 1.3, y: cy - Math.sin(a) * 48 + Math.cos(a) * k * 1.3 };
    g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    g.strokeStyle = '#A8A29E'; g.lineWidth = 1.6; g.stroke();
    g.fillStyle = '#57534E'; g.fillRect(q.x - 2, q.y - 2, 4, 4);
  }
};
/** A button sewn on for an eye: four holes, the thread crossed through them. */
const buttonEye = (g: Ctx, x: number, y: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#B91C1C'; g.beginPath(); g.arc(x, y, 10.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#DC2626'; g.beginPath(); g.arc(x - 2, y - 2, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7F1D1D'; g.beginPath(); g.arc(x, y, 8, 0.2, 1.6); g.lineTo(x, y); g.fill();
  g.strokeStyle = '#F5F5F4'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4); g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4); g.stroke();
  g.fillStyle = INK; for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) g.fillRect(x + dx - 1.5, y + dy - 1.5, 3, 3);
};
/** The gun hand at her temple (fight.ts: where she raises it to). */
const GUN_HAND = () => ({ x: LIB.head.x + 170, y: sy(160) });
const paintShot = (g: Ctx) => {
  const hx = LIB.head.x, hy = LIB.head.y, gl = gunLine(GUN_HAND()), d = gl.dir;
  // (the hole's middle, a little in from where the round came out; the pot in it)
  flowerPot(g, gl.exit.x - d.x * 18, gl.exit.y - d.y * 18, d);
  // (a seam from the pot across her brow and down her cheek: the crack it left, sewn with cable; staples)
  seamLine(g, hx - 14, hy - 50, hx + 30, hy - 40, '#D6D3D1');
  seamLine(g, hx - 26, hy + 6, hx - 40, hy + 56, '#D6D3D1');
  // (the eye the blast left her lost too: a button sewn on in its place)
  buttonEye(g, hx + 22, hy - 14);
  // (her neck seamed right round under the jaw (they had her head off to fill it); staples down it)
  seamLine(g, hx - 40, hy + 76, hx + 40, hy + 80, '#D6D3D1', 10, 7);
  for (const [sx, sy2, a] of [[hx - 26, hy + 110, 0.3], [hx + 20, hy + 120, -0.2], [hx - 8, hy - 52, 0.1]] as const) staple(g, sx, sy2, a);
};
const paintFell = (g: Ctx) => {
  const hx = LIB.head.x, hy = LIB.head.y;
  // (a cheek gone, patched with plain gray concrete, troweled flat, seamed round)
  g.fillStyle = INK; g.beginPath(); g.moveTo(hx + 8, hy + 10); g.lineTo(hx + 50, hy + 4); g.lineTo(hx + 46, hy + 56); g.lineTo(hx + 12, hy + 52); g.closePath(); g.fill();
  g.fillStyle = '#9A9590'; g.beginPath(); g.moveTo(hx + 10, hy + 12); g.lineTo(hx + 48, hy + 6); g.lineTo(hx + 44, hy + 54); g.lineTo(hx + 14, hy + 50); g.closePath(); g.fill();
  g.fillStyle = '#B4AFA8'; g.fillRect(hx + 14, hy + 12, 30, 4);
  for (let i = 0; i < 10; i++) { g.fillStyle = '#7A7570'; g.fillRect(hx + 16 + (i * 7) % 28, hy + 20 + (i * 11) % 28, 2, 2); }
  // (the cracks she came apart along, taped over: across her face, a big X on her brow, round her neck, over her shoulder)
  g.strokeStyle = INK; g.lineWidth = 2;
  g.beginPath(); g.moveTo(hx - 52, hy - 30); g.lineTo(hx - 20, hy - 6); g.lineTo(hx - 8, hy + 30); g.lineTo(hx + 20, hy + 62); g.stroke();
  tape(g, hx - 34, hy - 18, 54, 0.62); tape(g, hx - 12, hy + 16, 46, 1.2); tape(g, hx + 10, hy + 50, 44, 0.85);
  tape(g, hx + 6, hy - 46, 60, 0.5, 14); tape(g, hx + 6, hy - 46, 60, -0.5, 14);
  tape(g, hx - 36, hy + 90, 60, 0.08, 18); tape(g, hx + 22, hy + 94, 60, -0.06, 18);
  tape(g, LIB.shL.x - 30, LIB.shL.y - 10, 90, 0.9, 20); tape(g, LIB.shR.x + 40, LIB.shR.y - 6, 80, -0.7, 20);
  // (a bolt through her where tape wasn't enough)
  for (const [bx, by] of [[hx - 46, hy + 30], [hx + 34, hy - 20]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(bx, by, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#A8A8B0'; g.beginPath(); g.arc(bx, by, 4.4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#5A5A62'; g.fillRect(bx - 4, by - 1, 8, 2); }
};
LIB_HOOKS.over = (c: Ctx, Lk: LibLook) => {
  if (!on()) return;
  const statue = refightOn()?.statue ?? foreignRefight.statueNow!();
  // (she's shot herself again this time round: the pot's gone with the rest of that side)
  if (statue === 'shot' && Lk.broken > 0) return;
  const hx = LIB.head.x, hy = LIB.head.y;
  stamp(c, `rf-lib-${statue}`, hx - 300, hy - 140, 640, 380, g => (statue === 'fell' ? paintFell(g) : paintShot(g)));
};

// ---------------------------------------------------------------------------------------------------------------
// The hell along the berm's top (low: behind the slab, under her)

const paintBerm = (g: Ctx) => {
  const y = BERM_Y, x0 = VIEW_X;
  // (bones and skulls along it)
  for (let i = 0; i < 12; i++) {
    const x = x0 + 50 + i * 62 + (i * 29) % 20;
    g.save(); g.translate(x, y - 2); g.rotate((i * 0.9) % 3);
    g.fillStyle = INK; g.fillRect(-9, -3, 18, 6); g.fillStyle = '#C8B89A'; g.fillRect(-8, -2, 16, 4); g.fillRect(-10, -3, 4, 6); g.fillRect(6, -3, 4, 6);
    g.restore();
  }
  for (const [x, s] of [[x0 + 120, 1], [x0 + 470, 0.8], [x0 + 690, 1.1]] as const) {
    g.fillStyle = INK; g.beginPath(); g.arc(x, y - 9 * s, 9.4 * s, 0, Math.PI * 2); g.fill(); g.fillRect(x - 6 * s, y - 5 * s, 12 * s, 7 * s);
    g.fillStyle = '#D8CCB0'; g.beginPath(); g.arc(x, y - 9 * s, 8 * s, 0, Math.PI * 2); g.fill(); g.fillRect(x - 5 * s, y - 4 * s, 10 * s, 6 * s);
    g.fillStyle = '#2A0A0A'; g.fillRect(x - 5 * s, y - 11 * s, 3 * s, 3 * s); g.fillRect(x + 2 * s, y - 11 * s, 3 * s, 3 * s);
    // (shot through: his wrath took it out on the dead too)
    g.fillRect(x - 1, y - 16 * s, 2, 2);
  }
  // (a TV, kicked in, shot full of holes)
  const tx = x0 + 250;
  g.fillStyle = INK; g.fillRect(tx - 18, y - 30, 36, 30); g.fillStyle = '#3A3A40'; g.fillRect(tx - 17, y - 29, 34, 28); g.fillStyle = '#4A5A6A'; g.fillRect(tx - 13, y - 25, 24, 18);
  g.strokeStyle = '#E8F0FF'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 10, y - 22); g.lineTo(tx, y - 14); g.lineTo(tx - 6, y - 9); g.moveTo(tx, y - 14); g.lineTo(tx + 8, y - 20); g.stroke();
  g.fillStyle = INK; for (const [dx, dy] of [[-8, -18], [4, -12], [8, -24], [-14, -6]]) g.fillRect(tx + dx, y + dy, 3, 3);
  // (a mailbox, US Mail, more holes than mailbox)
  const mx = x0 + 560;
  g.fillStyle = INK; g.fillRect(mx - 2, y - 28, 5, 28); g.fillRect(mx - 12, y - 42, 24, 16);
  g.fillStyle = '#5A3A1A'; g.fillRect(mx - 1, y - 27, 3, 27); g.fillStyle = '#1E40AF'; g.fillRect(mx - 11, y - 41, 22, 14); g.fillStyle = '#3B5FD0'; g.fillRect(mx - 11, y - 41, 22, 3);
  g.fillStyle = INK; for (const [dx, dy] of [[-7, -36], [-2, -32], [4, -38], [7, -31], [0, -36]]) g.fillRect(mx + dx, y + dy, 2, 2);
  // (burning barrels)
  for (const bx of [x0 + 180, x0 + 400, x0 + 640]) {
    g.fillStyle = INK; g.fillRect(bx - 11, y - 28, 22, 28); g.fillStyle = '#4A3A2A'; g.fillRect(bx - 10, y - 27, 20, 27); g.fillStyle = '#6A5A3A'; g.fillRect(bx - 10, y - 20, 20, 2); g.fillRect(bx - 10, y - 8, 20, 2);
  }
};
SCENE_HOOKS.berm = (c, state) => {
  if (!on()) return;
  c.save(); c.globalAlpha = 0.8;
  stamp(c, 'rf-harry-berm', VIEW_X, BERM_Y - 60, 800, 64, paintBerm);
  c.restore();
  // (the barrels' fire, live: stepped tongues)
  const f = state.frame;
  for (const [i, bx] of [VIEW_X + 180, VIEW_X + 400, VIEW_X + 640].entries()) for (let k = 0; k < 3; k++) {
    const h = 12 + ((f >> 2) + k * 3 + i) % 4 * 4, x = bx - 8 + k * 6;
    c.fillStyle = k === 1 ? '#FDE047' : '#F97316'; c.fillRect(x, BERM_Y - 28 - h, 5, h);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him

const fightOf = (state: GameState): Fight | null => ((state.stage as { s?: { harry?: { f?: Fight | null } } } | null)?.s?.harry?.f ?? null);
const lookOf = () => refightOn()?.look ?? foreignRefight.lookNow();

export const foreignRefight: RefightDef = {
  land: 'foreign', id: refightId('foreign'), stage: refightStage('foreign'),
  boss: 'HELICOPTER HARRY', sin: 'WRATH',
  inner: foreignLayout, cp: 120,
  sign: { pic: 'statue', word: 'LIBERTY', color: '#1E40AF' },
  looks: ['spin', 'buried', 'barfed'],
  lookNow: () => keptForRevisits(MEMO_DEATH) || 'spin',
  statueNow: () => (keptForRevisits(MEMO_CRUMBLED) === '1' ? 'fell' : 'shot'),
  lookName: l => (l === 'buried' ? 'BURIED IN CEMENT (WEAKNESS)' : l === 'barfed' ? 'PUKED TO DEATH (WEAKNESS)' : 'SHOT BY HIS OWN ROUNDS'),
  swaps: () => [
    [H.HARRY_TAUNT, L.RF_HARRY_TAUNT], [H.HARRY_FIRE, L.RF_HARRY_FIRE], [H.HARRY_CROWN, L.RF_HARRY_CROWN],
    ...H.HARRY_STUCK.map((p, i) => [p, L.RF_HARRY_STUCK[i]] as [typeof p, typeof p]),
    [H.HARRY_UNSTUCK, L.RF_HARRY_UNSTUCK], [H.HARRY_FAKE, L.RF_HARRY_FAKE], [H.HARRY_CLING_DOWN, L.RF_HARRY_CLING_DOWN], [H.HARRY_CLING_UP, L.RF_HARRY_CLING_UP],
    [H.HARRY_BUTT, L.RF_HARRY_BUTT], [H.HARRY_HURT, L.RF_HARRY_HURT], [H.HARRY_GLOAT, L.RF_HARRY_GLOAT], [H.HARRY_COUNTER, L.RF_HARRY_COUNTER],
    [H.HARRY_LOW, L.RF_HARRY_LOW], [H.HARRY_SICK_FIRST, L.RF_HARRY_SICK_FIRST], [H.HARRY_SICK, L.RF_HARRY_SICK], [H.HARRY_CONCRETED, L.RF_HARRY_CONCRETED],
    [H.HARRY_FOLLOWUP, L.RF_HARRY_FOLLOWUP], [H.HARRY_CRUMBLE, L.RF_HARRY_CRUMBLE], [H.HARRY_ENRAGED, L.RF_HARRY_ENRAGED], [H.HARRY_GRIEF_SICK, L.RF_HARRY_GRIEF_SICK],
    [H.HARRY_BARF_DEATH, L.RF_HARRY_BARF_DEATH], [H.HARRY_DEATH, L.RF_HARRY_DEATH], [H.HARRY_PERFORATED, L.RF_HARRY_PERFORATED], [H.HARRY_BURIED, L.RF_HARRY_BURIED],
    [H.MH_HINT, L.RF_MH_HINT], [H.MH_STUCK, L.RF_MH_STUCK], [H.MH_CONCRETE, L.RF_MH_CONCRETE], [H.MH_CRUMBLE, L.RF_MH_CRUMBLE],
    [H.MH_WON, L.RF_MH_WON], [H.MH_WON_WEAK, L.RF_MH_WON_WEAK], [H.MH_WON_ALONE, L.RF_MH_WON_ALONE], [H.MH_WON_BARFED, L.RF_MH_WON_BARFED],
  ],
  // (the hell's low props go along the berm from the scene's own hook (SCENE_HOOKS.berm): the generic ones, drawn after
  // the land's whole back, would stand over her and him, both drawn in it)
  arena: () => null,
  bossAt: (state) => {
    const f = fightOf(state);
    if (!f || f.mode === 'dead' || f.act === 'crown') return null;
    const s = f.scale || 1;
    return { x: f.hx, feet: f.hy, w: 44 * s, h: 96 * s, face: f.facing };
  },
  stitches: look => look === 'buried'
    // (buried in her cement: chipped out, crusted gray in patches, his seams where they cracked him out of it)
    ? { thread: '#1A1A1A', patch: '#A8A29E', seams: [[0.15, 0.32, 0.85, 0.36], [0.3, 0.62, 0.7, 0.6]], patches: [[0.55, 0.05, 0.3, 0.12], [0.15, 0.4, 0.35, 0.16], [0.55, 0.72, 0.3, 0.18]], staples: [[0.5, 0.34], [0.35, 0.61]] }
    : look === 'barfed'
      // (puked to death: a new stomach sewn in, the seam right across his gut, green round it)
      ? { thread: '#1A1A1A', patch: '#84CC16', seams: [[0.12, 0.46, 0.88, 0.5], [0.5, 0.36, 0.5, 0.6], [0.3, 0.2, 0.7, 0.2]], staples: [[0.3, 0.47], [0.7, 0.49]], stain: { col: '#65A30D', k: 0.14 } }
      // (shot by his own rounds: every hole sewn shut)
      : { thread: '#F5F5F4', patch: '#7F1D1D', seams: [[0.25, 0.22, 0.75, 0.24]], holes: [[0.3, 0.32], [0.62, 0.36], [0.45, 0.48], [0.7, 0.58], [0.25, 0.62], [0.52, 0.12], [0.4, 0.76], [0.66, 0.84]] },
  update: (ctx) => {
    // (his own art's touches kept on him a little, by look: the cement's crust, the green round the gills)
    const f = fightOf(ctx.state);
    if (!f || f.mode !== 'on') return;
    const look = lookOf();
    if (look === 'buried') f.concrete = Math.max(f.concrete, 0.22);
    if (look === 'barfed') f.green = Math.max(f.green, 0.22);
  },
};

/** (contact sheets) Her overlay alone, in world space. */
export const paintStatueOverlay = (g: Ctx, statue: 'shot' | 'fell') => (statue === 'fell' ? paintFell(g) : paintShot(g));
