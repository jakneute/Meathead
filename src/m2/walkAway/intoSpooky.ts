// The walk into Spooky Land (portalWalk.ts): out of the portal and up a cobbled lane toward the town's iron gate (its
// arch: SPOOKY LAND), gas lamps and leaning tombstones either side, the castle on its hill and the ELEVATOR TO HELL's
// clock tower against the sky behind. The crude first pass (prototype boxes): the real look comes in the final pass.

import { type Ctx, type Prop, type PortalDef, HOR, box, hash } from './kit';
import { hourMix } from '../timeOfDay';

/** Picture px a meter for the props. */
const PPM = 24;
const GATE_Z = 17.5;

// The ground: dark cobbles, the lane down the middle
const ground = (g: Ctx, w: number, h: number) => {
  box(g, 0, 0, w, h, '#2A2438');
  for (let i = 0; i < 900; i++) box(g, hash(i * 1.37) * w, hash(i * 2.91) * h, 2, 1, i % 3 ? '#3A3350' : '#1C1828');
  box(g, w / 2 - 24, 0, 48, h, '#4A4458');
  for (let y = 0; y < h; y += 6) for (let x = w / 2 - 22; x < w / 2 + 22; x += 8) box(g, x + ((y / 6) % 2) * 4, y, 6, 4, '#5A5470');
};

// The far off: the castle on its hill, the clock tower
const back = (c: Ctx) => {
  const hill = hourMix('#2A1B45', '#2A1630', '#120A20');
  c.fillStyle = hill;
  c.beginPath(); c.moveTo(60, HOR); c.quadraticCurveTo(200, HOR - 40, 340, HOR); c.fill();
  // (the castle)
  box(c, 160, HOR - 62, 80, 36, '#1E1430');
  for (let i = 0; i < 4; i++) box(c, 156 + i * 26, HOR - 78, 14, 20, '#1E1430');
  box(c, 196, HOR - 50, 6, 8, '#FDE68A');
  // (the clock tower, off to the right)
  box(c, 300, HOR - 96, 22, 96, '#24183A');
  box(c, 305, HOR - 88, 12, 12, '#D9C98A');
};

const paintGate = (g: Ctx, w: number, h: number) => {
  box(g, 0, h * 0.2, w * 0.08, h * 0.8, '#18181B');
  box(g, w * 0.92, h * 0.2, w * 0.08, h * 0.8, '#18181B');
  box(g, 0, h * 0.12, w, h * 0.16, '#2E1065');
  box(g, 0, h * 0.12, w, 2, '#86EFAC');
  g.font = `${Math.max(8, Math.round(h * 0.1))}px "Press Start 2P"`; g.textAlign = 'center'; g.fillStyle = '#BBF7D0';
  g.fillText('SPOOKY LAND', w / 2, h * 0.25);
  for (let x = w * 0.12; x < w * 0.88; x += w * 0.06) box(g, x, h * 0.3, 2, h * 0.7, '#27272A');
};
const paintLamp = (g: Ctx, w: number, h: number) => {
  box(g, w / 2 - 2, h * 0.15, 4, h * 0.85, '#18181B');
  box(g, w / 2 - 7, h * 0.05, 14, 14, '#FDE68A');
};
const paintStone = (seed: number) => (g: Ctx, w: number, h: number) => {
  box(g, w * 0.15, h * 0.2 + hash(seed) * 6, w * 0.7, h * 0.8, '#52525B');
  box(g, w * 0.15, h * 0.2 + hash(seed) * 6, w * 0.7, 3, '#A1A1AA');
};

const props = (): Prop[] => {
  const out: Prop[] = [{ id: 'pw-spk-gate', x: 0, z: GATE_Z, w: 9, h: 7, ppm: PPM, paint: paintGate }];
  for (let i = 0; i < 8; i++) out.push({ id: 'pw-spk-lamp', x: i % 2 ? 2.6 : -2.6, z: 3 + i * 2.2, w: 1, h: 4, ppm: PPM, paint: paintLamp });
  for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1; out.push({ id: `pw-spk-stone${i % 3}`, x: side * (4 + hash(i) * 3), z: 2 + i * 1.4, w: 1, h: 1.3, ppm: PPM, paint: paintStone(i % 3) }); }
  return out;
};

export const INTO_SPOOKY: PortalDef = {
  land: 'SPOOKY LAND',
  lines: ['A HAUNTED CASTLE. THE GHOSTS ARE UNIONIZED.', 'FIRST STOP: THE TOWN SQUARE.'],
  haze: '#3A2E52',
  ground, back, props,
  rim: () => hourMix('#BBF7D0', '#F59E0B', '#86EFAC'),
};
