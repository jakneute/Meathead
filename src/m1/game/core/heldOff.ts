// A card closed by a button (Meathead 2's YOU GOT cards, minigame cards): that button, still held, mustn't go on to jump,
// shoot or charge as play comes back (the owner: "when you press A or B to close a menu that announces something, make
// sure the buttons action doesn't step onto the character actions ... like getting a health pickup"). The action buttons
// are held off till every one of them is let go; then a fresh press counts.

import type { Controls } from '../platform/input';

let heldOff = false;
export const holdControlsTillRelease = () => { heldOff = true; };
export const controlsHeldOff = () => heldOff;

/** This frame's controls with the action buttons dropped while they're held off (directions still go through). */
export const applyHeldOff = (c: Controls): Controls => {
  if (!heldOff) return c;
  if (!c.jump && !c.shoot && !c.special && !c.secondary && !c.charge) { heldOff = false; return c; }
  return { ...c, jump: false, shoot: false, special: false, secondary: false, charge: false };
};
