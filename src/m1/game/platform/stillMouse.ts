// A mouse that hasn't moved doesn't pick menu items. When a menu changes under a cursor sitting still (a controller or
// the keyboard moved the selection, a page opened, a row grew), the browser fires a fresh mouseover/mouseout at
// whatever's under it now, and every menu's onMouseEnter took that as a hover: the selection snapped back to the idle
// cursor. Those come with no movement and at the spot the mouse last moved to, so they're stopped here (window,
// capture: before React's own listeners on the root ever see them). A real move onto an item still picks it.

let last: { x: number; y: number } | null = null;

const still = (e: MouseEvent) => e.movementX === 0 && e.movementY === 0 && (!last || (e.clientX === last.x && e.clientY === last.y));

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', e => { last = { x: e.clientX, y: e.clientY }; }, true);
  for (const type of ['mouseover', 'mouseout'] as const) {
    window.addEventListener(type, e => { if (still(e)) e.stopPropagation(); }, true);
  }
}

export {};
