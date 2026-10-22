// The mallet worn right out (weapons/mallet.ts): its picture for the HUD and the pause menu, in the weapon icons' 32x32
// pixels. The handle as the mallet's own icon has it (up from the bottom left, lit along its top edge), snapped off a
// little over halfway: a jagged end, the pale wood inside showing, a splinter or two sticking out, a crack back down it.

import React from 'react';

const INK = '#1A0B06';
/** Across the handle (x + y, 30 to 36): its shading, lit edge to dark. */
const RAMP: Record<number, string> = { 30: '#FBBF24', 31: '#D97706', 32: '#D97706', 33: '#B45309', 34: '#B45309', 35: '#92400E', 36: '#78350F' };
/** Where it snapped, along it (x - y), for each row across: ragged. */
const END: Record<number, number> = { 30: -9, 31: -12, 32: -8, 33: -11, 34: -13, 35: -9, 36: -12 };

const px = new Map<string, string>();
const set = (x: number, y: number, c: string) => { if (x >= 0 && y >= 0 && x < 32 && y < 32) px.set(`${x},${y}`, c); };
const inside = (x: number, y: number) => { const u = x - y, v = x + y; return v >= 30 && v <= 36 && u >= -26 && u <= END[v]; };
for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
  if (!inside(x, y)) continue;
  const u = x - y, v = x + y;
  // (the break: the pale wood inside, at the very end of each row)
  set(x, y, u >= END[v] - 1 ? '#FDE68A' : RAMP[v]);
}
// (the crack back down it, a couple of splinters off the end)
for (const [x, y] of [[7, 25], [6, 26], [8, 25]]) if (inside(x, y)) set(x, y, '#5B2A0A');
for (const [x, y, c] of [[12, 15, '#FDE68A'], [13, 14, '#FBBF24'], [14, 18, '#FDE68A'], [16, 18, '#D97706']] as const) set(x, y, c);
// (the outline: ink round everything drawn)
const ink: [number, number][] = [];
for (const k of px.keys()) {
  const [x, y] = k.split(',').map(Number);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!px.has(`${x + dx},${y + dy}`)) ink.push([x + dx, y + dy]);
}
for (const [x, y] of ink) if (!px.has(`${x},${y}`)) set(x, y, INK);

/** Its pixels, as the icons are drawn (children of a 32x32 svg). */
export const BROKEN_STICK_ART: React.ReactNode = React.createElement(React.Fragment, null,
  ...[...px.entries()].map(([k, c]) => { const [x, y] = k.split(',').map(Number); return React.createElement('rect', { key: k, x, y, width: 1, height: 1, fill: c }); }));
