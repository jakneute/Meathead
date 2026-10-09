// THE JUNGLE CRUISE QUEUE. Out of the jungle onto the queue's plaza: three lanes, three wait times (the extra fast
// pass the longest of the lot), the line packed solid behind its fence. Meathead reads the signs, says fuck that, and
// goes over the crates and the staff fence, round the back: the staff out there on break can't be arsed to stop him
// (it's the extra fast pass, they tell the people in line through the fence; whatever he looks like). Down the back to
// the loading dock, past the family at the front of the line, onto their boat (the river: Safari Artie's).
//
// Left to right (relative to x0):
//   0..440     the plaza: the entrance, the signs, the line behind its rails; crates up to the staff fence
//   440..1480  out back: dumpsters, pallets, an AC unit, the staff on break; the line through the chain-link behind
//   1480..2000 the loading dock: the front of the line, the operator, the boat (on to the river at its end)

import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import type { Section } from '../section';
import { lay, solid, ledge, teleport, box, label, saidOver, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { talk, stepTalk, pick, type Talk } from './talk';
import { guestAt, drawGuest, type Guest } from './crowd';
import { staffDoing, staffTalking, staffLook, type StaffDoing } from './staff';
import { MEATHEAD_SIGNS, MEATHEAD_BACK, GUEST_CUT, STAFF_EXCUSE, STAFF_IDLE, STAFF_HIT, GUEST_FRONT, OPERATOR_DOCK, type Dressed } from './lines';

const { x0, x1 } = SECTIONS.queue;
const R = (x: number) => x0 + x;
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** Where things are (relative). */
const FENCE = { x: 430, w: 24, h: 170 };
const CRATES = [{ x: 270, w: 60, h: 50 }, { x: 330, w: 70, h: 110 }, { x: 470, w: 60, h: 90 }];
const DUMPSTER = { x: 580, w: 96, h: 56 }, AC = { x: 1150, w: 70, h: 70 };
const PALLETS = { x: 900, y: 60, w: 90 };
const STAFF: [x: number, doing: StaffDoing, facing: 1 | -1][] = [[650, 'smoke', -1], [840, 'phone', 1], [1070, 'sit', -1], [1310, 'broom', 1]];
const OPERATOR_X = 1720;
/** Where the people in line, out back, complain through the fence (relative x, once each). */
const CUT_AT = [720, 1010, 1360];
const BOARD_AT = 1880;

interface Queue {
  talk: Talk;
  staff: { e: Enemy; hp: number; idle: boolean; hit: boolean; said: string | null }[];
  /** The line: at the plaza (behind the rails), out back (through the chain-link), and the front of it at the dock. */
  plaza: Guest[]; back: Guest[]; front: Guest[];
  signs: boolean; over: boolean; cuts: boolean[]; dock: boolean;
}
const getQ = (state: GameState) => sectionState<Queue>(state, 'queue', () => ({
  talk: talk(), staff: [], plaza: [], back: [], front: [], signs: false, over: false, cuts: CUT_AT.map(() => false), dock: false,
}));

const addStaff = (state: GameState, q: Queue, x: number, doing: StaffDoing, facing: 1 | -1) => {
  const e = makeKindEnemy('m2:staffer', R(x), GY);
  e.homeX = R(x) * 3 + 11; e.facing = facing; e.seen = true;
  staffDoing.set(e, doing);
  state.enemies.push(e);
  q.staff.push({ e, hp: e.health, idle: false, hit: false, said: null });
  return e;
};
/** A staffer's line: their mouth going while it's said. */
const staffSays = (q: Queue, s: Queue['staff'][number], text: string) => {
  const voice = staffDoingVoice(s.e);
  q.talk.q.push({ voice, text, set: t => { s.said = t; if (t) staffTalking.add(s.e); else staffTalking.delete(s.e); } });
};
const staffDoingVoice = (e: Enemy) => (staffLook(e.homeX ?? 0).woman ? 'm2.operator2' : 'm2.operator');
const guestSays = (q: Queue, g: Guest, text: string) => q.talk.q.push({ voice: g.voice, text, set: t => { g.said = t; } });
const nearest = <T extends { x: number }>(a: T[], x: number) => a.reduce((b, g) => (Math.abs(g.x - x) < Math.abs(b.x - x) ? g : b));

export const queue: Section = {
  id: 'queue', x0, x1,
  checkpoints: [{ name: 'THE JUNGLE CRUISE QUEUE', cp: 10, x: x0 + 150, y: GY }],
  build: (state) => {
    lay(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'concrete' }]);
    const q = getQ(state);
    for (const c of CRATES) solid(state, R(c.x), GY - c.h, c.w, c.h, { hidden: true });
    solid(state, R(FENCE.x), GY - FENCE.h, FENCE.w, FENCE.h, { hidden: true });
    solid(state, R(DUMPSTER.x), GY - DUMPSTER.h, DUMPSTER.w, DUMPSTER.h, { hidden: true });
    solid(state, R(AC.x), GY - AC.h, AC.w, AC.h, { hidden: true });
    ledge(state, R(PALLETS.x), GY - PALLETS.y, PALLETS.w, { hidden: true });
    for (const [x, doing, facing] of STAFF) addStaff(state, q, x, doing, facing);
    addStaff(state, q, OPERATOR_X, 'stand', -1);
    // (the line: packed along the plaza behind the rails, along the fence out back, and the family at the front)
    for (let i = 0; i < 9; i++) q.plaza.push(guestAt(i, R(160 + i * 30), GY - 26, i % 3 ? 1 : -1, 0.8));
    for (let i = 0; i < 22; i++) q.back.push(guestAt(i + 9, R(480 + i * 46 + (i % 2) * 8), GY - 40, i % 4 === 1 ? -1 : 1, 0.78));
    for (let i = 0; i < 4; i++) q.front.push(guestAt(i + 31, R(1560 + i * 34), GY, i ? -1 : 1, 0.95));
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    const q = getQ(state);
    const px = p.pos.x + p.width / 2, rx = px - x0;
    const d = dressed(state);
    stepTalk(state, q.talk);
    // At the signs: three hours, the extra fast pass longer still. Fuck that.
    if (!q.signs && rx > 210 && rx < 600) { q.signs = true; for (const t of MEATHEAD_SIGNS) q.talk.q.push({ voice: 'meathead', text: t }); }
    // Over the fence: the back way
    if (!q.over && rx > FENCE.x + 60 && rx < 900) { q.over = true; q.talk.q.push({ voice: 'meathead', text: MEATHEAD_BACK }); }
    // The line sees him through the chain-link; a staffer explains
    CUT_AT.forEach((x, i) => {
      if (q.cuts[i] || Math.abs(rx - x) > 80) return;
      q.cuts[i] = true;
      if (q.talk.q.length > 2) return;
      guestSays(q, nearest(q.back, px), pick(GUEST_CUT[d]));
      const s = q.staff.filter(s => s.e.health > 0 && s.e.pos.x - x0 < 1500);
      if (s.length) staffSays(q, nearest(s.map(s => ({ ...s, x: s.e.pos.x })), px), pick(STAFF_EXCUSE[d]));
    });
    // The staff: a word as he goes by (once each); hit, they take it
    for (const s of q.staff) {
      if (s.e.health <= 0) continue;
      if (s.e.health < s.hp && !s.hit) { s.hit = true; staffSays(q, s, pick(STAFF_HIT)); }
      s.hp = s.e.health;
      const sx = s.e.pos.x + s.e.width / 2;
      if (!s.idle && Math.abs(sx - px) < 110 && sx - x0 < 1500 && !q.talk.busy && !q.talk.q.length) { s.idle = true; staffSays(q, s, pick(STAFF_IDLE[d])); }
    }
    // The dock: the front of the line, the operator
    if (!q.dock && rx > 1530 && rx < 1700) {
      q.dock = true;
      q.talk.q.push({ voice: q.front[1].voice, text: pick(GUEST_FRONT[d]), set: t => { q.front[1].said = t; } });
      const op = q.staff[q.staff.length - 1];
      if (op.e.health > 0) staffSays(q, op, pick(OPERATOR_DOCK[d]));
    }
    // Onto the boat: the river. (And back the way he came: the jungle's end.)
    if (rx > BOARD_AT) teleport(state, SECTIONS.river.x0 + 150, GY);
    if (rx < 40) { teleport(state, SECTIONS.jungle.x1 - 200, GY); p.facing = -1; }
    return controls;
  },
  drawBackdrop: (c, state) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#7DD3FC'); g.addColorStop(1, '#BEF264');
    c.fillStyle = g; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.fillStyle = '#166534';
    for (let i = -1; i < 10; i++) { const x = i * 120 - ((state.camera.x * 0.2) % 120); c.beginPath(); c.arc(x, GY - 360 - state.camera.y, 90, Math.PI, 0); c.fill(); }
    c.fillStyle = '#14532D'; c.fillRect(0, GY - 360 - state.camera.y, CANVAS_WIDTH, CANVAS_HEIGHT + 1000);
    return true;
  },
  drawBack: (c, state) => {
    if (state.camera.x > x1 + 200 || state.camera.x + CANVAS_WIDTH < x0 - 200) return;
    const q = getQ(state), f = state.frame;
    // (the sky's the jungle's: far trees, then the queue building's back wall)
    for (let x = x0; x < x1; x += 90) { box(c, x + 30, GY - 330, 12, 330, '#713F12'); c.fillStyle = '#15803D'; c.beginPath(); c.arc(x + 36, GY - 340, 50, 0, Math.PI * 2); c.fill(); }
    // The plaza: the entrance arch, the signs
    box(c, R(40), GY - 260, 20, 260, '#78350F'); box(c, R(240), GY - 260, 20, 260, '#78350F');
    box(c, R(30), GY - 290, 240, 46, '#A16207');
    label(c, 'JUNGLE CRUISE', R(150), GY - 262, '#FEF3C7', 12);
    const signs: [string, string][] = [['STANDBY', '180 MIN'], ['FAST PASS', '175 MIN'], ['EXTRA FAST PASS', '185 MIN']];
    signs.forEach(([a, b], i) => {
      const sx = R(70 + i * 86), sy = GY - 220 + i * 6;
      box(c, sx - 42, sy, 84, 34, '#1C1917'); box(c, sx - 40, sy + 2, 80, 30, '#FDE68A');
      label(c, a, sx, sy + 13, '#7C2D12', 5); label(c, b, sx, sy + 27, '#B91C1C', 7);
    });
    // (the line, at the plaza: behind the rails)
    for (const g of q.plaza) drawGuest(c, g, f, 'brightness(0.75)');
    box(c, R(140), GY - 40, 290, 4, '#A8A29E'); box(c, R(140), GY - 20, 290, 4, '#A8A29E');
    for (let x = 140; x <= 430; x += 48) box(c, R(x), GY - 44, 4, 44, '#78716C');
    // Out back: the building's backside, the chain-link with the line packed in behind it
    box(c, R(440), GY - 300, 1040, 300, '#57534E');
    for (let x = 440; x < 1480; x += 80) box(c, R(x), GY - 300, 2, 300, '#44403C');
    for (const g of q.back) drawGuest(c, g, f, 'brightness(0.6)');
    c.strokeStyle = 'rgba(203,213,225,0.45)'; c.lineWidth = 1;
    for (let x = 440; x < 1480; x += 10) { c.beginPath(); c.moveTo(R(x), GY - 150); c.lineTo(R(x + 10), GY - 40); c.moveTo(R(x + 10), GY - 150); c.lineTo(R(x), GY - 40); c.stroke(); }
    box(c, R(440), GY - 152, 1040, 4, '#94A3B8'); box(c, R(440), GY - 42, 1040, 3, '#94A3B8');
    label(c, 'CAST MEMBERS ONLY', R(560), GY - 230, '#FDE047', 8);
    label(c, 'EXTRA FAST PASS  >>', R(1000), GY - 200, '#F472B6', 8);
    label(c, 'NO SMOKING', R(660), GY - 180, '#FCA5A5', 6);
    // The dock: the loading platform, the water, the boat waiting
    box(c, R(1480), GY - 300, 520, 300, '#3F3F46');
    label(c, 'LOADING DOCK', R(1640), GY - 240, '#FDE68A', 9);
    label(c, 'PLEASE WAIT HERE', R(1600), GY - 120, '#E5E7EB', 6);
    for (const g of q.front) drawGuest(c, g, f);
    // The ground, the crates, the fence (lit top lips: they're stood on), the dumpster, the pallets, the AC
    box(c, x0, GY, x1 - x0, 400, '#78716C'); box(c, x0, GY, x1 - x0, 3, '#A8A29E');
    box(c, R(1480), GY, 420, 400, '#92400E'); for (let x = 1480; x < 1900; x += 24) box(c, R(x), GY, 2, 30, '#78350F');
    // (the end of the dock: the river, the boat waiting)
    box(c, R(1900), GY, 100, 400, '#0E7490'); box(c, R(1900), GY + 38, 100, 2, '#BAE6FD');
    box(c, R(1904), GY + 24, 96, 26, '#B45309'); box(c, R(1904), GY + 24, 96, 3, '#FDE68A');
    for (let k = 0; k < 96; k += 24) { box(c, R(1904 + k), GY - 102, 12, 10, '#DC2626'); box(c, R(1916 + k), GY - 102, 12, 10, '#F8FAFC'); }
    box(c, R(1910), GY - 96, 4, 120, '#A8A29E');
    for (const cr of CRATES) { box(c, R(cr.x), GY - cr.h, cr.w, cr.h, '#B45309'); box(c, R(cr.x), GY - cr.h, cr.w, 3, '#FCD34D'); c.strokeStyle = '#78350F'; c.lineWidth = 2; c.strokeRect(R(cr.x) + 3, GY - cr.h + 4, cr.w - 6, cr.h - 7); }
    box(c, R(FENCE.x), GY - FENCE.h, FENCE.w, FENCE.h, '#0F766E'); box(c, R(FENCE.x), GY - FENCE.h, FENCE.w, 3, '#5EEAD4');
    label(c, 'STAFF', R(FENCE.x + 12), GY - 90, '#F8FAFC', 5);
    box(c, R(DUMPSTER.x), GY - DUMPSTER.h, DUMPSTER.w, DUMPSTER.h, '#166534'); box(c, R(DUMPSTER.x), GY - DUMPSTER.h, DUMPSTER.w, 3, '#4ADE80');
    box(c, R(AC.x), GY - AC.h, AC.w, AC.h, '#9CA3AF'); box(c, R(AC.x), GY - AC.h, AC.w, 3, '#F3F4F6');
    c.strokeStyle = '#6B7280'; c.beginPath(); c.arc(R(AC.x + 35), GY - 35, 22, 0, Math.PI * 2); c.stroke();
    box(c, R(PALLETS.x), GY - PALLETS.y, PALLETS.w, 12, '#A16207'); box(c, R(PALLETS.x), GY - PALLETS.y, PALLETS.w, 3, '#FDE68A');
    for (let x = 0; x < PALLETS.w; x += 22) box(c, R(PALLETS.x + x), GY - PALLETS.y + 12, 8, PALLETS.y - 12, '#854D0E');
    // Said over people in line
    for (const g of [...q.plaza, ...q.back, ...q.front]) if (g.said) saidOver(c, g.said, g.x, g.y - 90, '#FDE68A');
  },
  drawFront: (c, state) => {
    if (state.camera.x > x1 + 200 || state.camera.x + CANVAS_WIDTH < x0 - 200) return;
    const q = getQ(state);
    // (the staff's words over them)
    for (const s of q.staff) if (s.said && s.e.health > 0) saidOver(c, s.said, s.e.pos.x + s.e.width / 2, s.e.pos.y - 26, '#99F6E4');
  },
};
