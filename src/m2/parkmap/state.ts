// The park map's up or not (SELECT on a pad, TAB or M on the keys, MAP in the pause menu), and where it was opened
// from: out of play (shutting it plays on) or out of the pause menu (shutting it goes back to the menu). App.tsx opens
// and shuts it; ParkMap.tsx reads its own input while it's up.

type From = 'play' | 'pause';
let open: From | null = null;
/** When it was last shut (the press that shut it isn't one for whatever's under it too). */
let shutAt = 0;
const listeners = new Set<() => void>();
const tell = () => listeners.forEach(l => l());

export const parkMapFrom = () => open;
export const parkMapOpen = () => open !== null;
/** Up, or shut a moment ago. */
export const parkMapBusy = () => open !== null || performance.now() - shutAt < 150;
export const openParkMap = (from: From) => { if (open) return; open = from; tell(); };
export const closeParkMap = () => { if (!open) return; open = null; shutAt = performance.now(); tell(); };
export const subscribeParkMap = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
