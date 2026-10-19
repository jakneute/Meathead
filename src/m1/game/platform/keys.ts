// The keyboard's and the mouse's game buttons, and which does what (the options screen can change them; the
// controller's buttons stay where they are, and so do the menus' keys: only playing changes). Keys go by where they
// are on the keyboard (KeyboardEvent.code, lowercase), so a remap means the same spot whatever the layout; the mouse's
// buttons are 'mouse0' (left), 'mouse1' (middle), 'mouse2' (right), 'mouse3' and 'mouse4' (the side ones). Each
// action has two: a primary and a secondary.

// (Meathead 2's grabs, 'beatdown', 'shakedown', 'airGrab': its own, listed only once it's put its profile in, setKeyProfile)
export type KeyAction = 'left' | 'right' | 'up' | 'down' | 'jump' | 'fire' | 'secondary' | 'special' | 'charge' | 'uppercut' | 'downSpecial' | 'prevWeapon' | 'nextWeapon'
  | 'beatdown' | 'shakedown' | 'airGrab';
export type KeyBindings = Record<KeyAction, string[]>;

/** How many keys an action can have. */
export const KEY_SLOTS = 2;

/** In the order the options screen lists them, with what it calls them. */
export const KEY_ACTIONS: { id: KeyAction; label: string; required?: boolean }[] = [
  { id: 'left', label: 'MOVE LEFT', required: true },
  { id: 'right', label: 'MOVE RIGHT', required: true },
  { id: 'up', label: 'UP / AIM UP', required: true },
  { id: 'down', label: 'DOWN / CROUCH', required: true },
  { id: 'jump', label: 'JUMP', required: true },
  { id: 'fire', label: 'FIRE' },
  { id: 'secondary', label: 'SECONDARY FIRE' },
  { id: 'special', label: 'SPECIAL' },
  { id: 'charge', label: 'SHOULDER CHARGE' },
  { id: 'uppercut', label: 'UPPERCUT' },
  { id: 'downSpecial', label: 'SLIDE / DIVE KICK' },
  { id: 'prevWeapon', label: 'PREVIOUS WEAPON' },
  { id: 'nextWeapon', label: 'NEXT WEAPON' },
];

export const DEFAULT_KEYS: KeyBindings = {
  left: ['keya', 'arrowleft'],
  right: ['keyd', 'arrowright'],
  up: ['keyw', 'arrowup'],
  down: ['keys', 'arrowdown'],
  jump: ['space', 'keyz'],
  fire: ['mouse0', 'keyx'],
  secondary: ['keyf'],
  special: ['mouse2'],
  charge: ['shiftleft', 'shiftright'],
  uppercut: ['keye'],
  downSpecial: ['keyc'],
  prevWeapon: ['wheelup'],
  nextWeapon: ['wheeldown'],
  beatdown: [], shakedown: [], airGrab: [],
};

/** Keys a game keeps for itself, on top of isReservedKey's (Meathead 2's P: its pause). */
let extraReserved: string[] = [];

/**
 * Meathead 2's keyboard: its own actions (the grabs after the charge moves), its own defaults (the left button alone
 * fires; R, T and Q grab) and P kept for its pause. Changed in place, before the settings are loaded (loadSettings):
 * whatever imported the list or the defaults sees the new ones.
 */
export const setKeyProfile = (profile: 'm2') => {
  if (profile !== 'm2') return;
  const at = KEY_ACTIONS.findIndex(a => a.id === 'downSpecial') + 1;
  KEY_ACTIONS.splice(at, 0, { id: 'beatdown', label: 'BEATDOWN' }, { id: 'shakedown', label: 'SHAKEDOWN' }, { id: 'airGrab', label: 'AIR GRAB' });
  Object.assign(DEFAULT_KEYS, { fire: ['mouse0'], beatdown: ['keyr'], shakedown: ['keyt'], airGrab: ['keyq'] });
  extraReserved = ['keyp'];
  bindings = cloneKeys(DEFAULT_KEYS);
  version++;
};

/** The mouse wheel's two notches: bindable, but only to the weapon cycling (a notch is a tap, never held). */
export const isWheelCode = (code: string) => code === 'wheelup' || code === 'wheeldown';
export const wheelFits = (a: KeyAction) => a === 'prevWeapon' || a === 'nextWeapon';

/**
 * Keys that can't be given to anything: Esc (pause, and back in every menu), the number keys (each picks its weapon),
 * the F keys (the browser's: F11 is fullscreen), and the system's own.
 */
export const isReservedKey = (code: string) =>
  code === 'escape' || extraReserved.includes(code) || /^digit[1-9]$/.test(code) || /^f\d+$/.test(code) || code.startsWith('meta') || code.startsWith('os') || code === 'contextmenu' || code === 'unidentified' || code === '';

let bindings: KeyBindings = cloneKeys(DEFAULT_KEYS);
let version = 0;
const listeners = new Set<() => void>();

/** Every action's two slots, an empty one '' (a cleared primary leaves the secondary where it is). */
function cloneKeys(k: KeyBindings): KeyBindings {
  const out = {} as KeyBindings;
  for (const a of KEY_ACTIONS) out[a.id] = Array.from({ length: KEY_SLOTS }, (_, i) => k[a.id]?.[i] ?? '');
  return out;
}

const validCode = (c: string) => c === '' || (!isReservedKey(c) && /^[a-z0-9]+$/.test(c));

/** Whatever's been saved, checked over: anything unknown or doubled up is dropped, anything missing is the default. */
export const sanitizeKeys = (raw: unknown): KeyBindings => {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = {} as KeyBindings;
  const used = new Set<string>();
  for (const a of KEY_ACTIONS) {
    const v = src[a.id];
    const list = Array.isArray(v) ? v.map(c => (typeof c === 'string' ? c.toLowerCase() : '')) : DEFAULT_KEYS[a.id];
    out[a.id] = Array.from({ length: KEY_SLOTS }, (_, i) => {
      const c = list[i] ?? '';
      if (!validCode(c) || (c && used.has(c)) || (isWheelCode(c) && !wheelFits(a.id))) return '';
      if (c) used.add(c);
      return c;
    });
  }
  // (saved before the wheel could be bound: the weapon cycling's left empty, so it gets the wheel)
  if (![...out.prevWeapon, ...out.nextWeapon].some(Boolean) && !Object.values(out).flat().some(isWheelCode)) {
    out.prevWeapon[0] = 'wheelup'; out.nextWeapon[0] = 'wheeldown';
  }
  return out;
};

export const getKeyBindings = (): KeyBindings => bindings;
export const setKeyBindings = (k: KeyBindings) => { bindings = cloneKeys(k); version++; listeners.forEach(f => f()); };
/** The keys (and mouse buttons) bound to an action right now. */
export const keysFor = (a: KeyAction): string[] => (bindings[a] ?? []).filter(Boolean);
export const subscribeKeys = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const keysVersion = () => version;

/**
 * Puts a key in an action's slot. A key that's already another action's (or this one's other slot) is swapped: that
 * slot gets whatever this one had (which may be nothing). Returns the bindings, and the action it was taken from.
 */
export const bindKey = (k: KeyBindings, action: KeyAction, slot: number, code: string): { keys: KeyBindings; from?: KeyAction } => {
  const out = cloneKeys(k);
  const old = out[action][slot];
  let from: KeyAction | undefined;
  for (const a of KEY_ACTIONS) out[a.id].forEach((c, i) => {
    // (the wheel can't be swapped onto something it doesn't fit: that one's just left empty)
    if (c === code && !(a.id === action && i === slot)) { out[a.id][i] = isWheelCode(old) && !wheelFits(a.id) ? '' : old; if (a.id !== action) from = a.id; }
  });
  out[action][slot] = code;
  return { keys: out, from };
};
export const clearKey = (k: KeyBindings, action: KeyAction, slot: number): KeyBindings => {
  const out = cloneKeys(k);
  out[action][slot] = '';
  return out;
};

const NAMED: Record<string, string> = {
  space: 'SPACE', arrowleft: '◀', arrowright: '▶', arrowup: '▲', arrowdown: '▼',
  shiftleft: 'L-SHIFT', shiftright: 'R-SHIFT', controlleft: 'L-CTRL', controlright: 'R-CTRL', altleft: 'L-ALT', altright: 'R-ALT',
  enter: 'ENTER', numpadenter: 'NUM ENTER', backspace: 'BKSP', tab: 'TAB', capslock: 'CAPS', insert: 'INS', delete: 'DEL',
  home: 'HOME', end: 'END', pageup: 'PG UP', pagedown: 'PG DN', minus: '-', equal: '=', bracketleft: '[', bracketright: ']',
  backslash: '\\', semicolon: ';', quote: "'", backquote: '`', comma: ',', period: '.', slash: '/', intlbackslash: '\\',
  numpadadd: 'NUM +', numpadsubtract: 'NUM -', numpadmultiply: 'NUM *', numpaddivide: 'NUM /', numpaddecimal: 'NUM .',
  digit0: '0', scrolllock: 'SCR LK', pause: 'PAUSE', numlock: 'NUM LK', printscreen: 'PRT SC',
};
export const isMouseCode = (code: string) => /^mouse\d$/.test(code);
/** What's printed on a key (for its keycap), or what a mouse button's called. */
export const keyLabel = (code: string): string => {
  if (NAMED[code]) return NAMED[code];
  if (code === 'wheelup') return 'WHEEL ▲';
  if (code === 'wheeldown') return 'WHEEL ▼';
  if (isMouseCode(code)) return ['L-CLICK', 'M-CLICK', 'R-CLICK', 'MOUSE 4', 'MOUSE 5'][Number(code.slice(5))] ?? `MOUSE ${Number(code.slice(5)) + 1}`;
  if (/^key[a-z]$/.test(code)) return code.slice(3).toUpperCase();
  if (/^digit\d$/.test(code)) return code.slice(5);
  if (/^numpad\d$/.test(code)) return `NUM ${code.slice(6)}`;
  return code.toUpperCase();
};
/** The action's primary key (or, if that's been cleared, its secondary), undefined if it's got neither. */
export const primaryKey = (a: KeyAction): string | undefined => bindings[a]?.find(Boolean);
export const isKeyAction = (s: string): s is KeyAction => KEY_ACTIONS.some(a => a.id === s);
