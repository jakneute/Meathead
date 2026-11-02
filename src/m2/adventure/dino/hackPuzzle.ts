// THE PADDOCK GATE HACK's puzzle: the part of the minigame that's meant to be swapped out or redone (the owner, 2026-11-01:
// "don't make it too complicated, but it works in more of a 'puzzle' fashion. we'll figure out how it works later").
// hack.ts runs it and the terminal round it (hackArt.ts drawTerminal); everything about how the puzzle itself works is
// in here, behind HackPuzzle. A new kind of puzzle is a new make function returning a HackPuzzle, and newPuzzle()
// pointing at it.
//
// THE FIRST PASS: THE TUMBLER CIPHER. The password's on the screen in the park's dino runes; the maintenance man's key
// (runes to letters) is on a sticky note on the bezel. Six letter wheels under the runes: set them to spell it. The
// catch: the wheels are linked, each one turns the one to its right with it (the last turns alone), so it's done left
// to right. It can't get stuck: every setting can be reached, and after a while the screen helps (a wheel that's right
// lights up; later the letters are written under the runes).
//
// Controls (hack.ts turns the buttons into PuzzleIn): left / right pick a wheel, up / down (or confirm) turn it; the
// mouse clicks a wheel's top half to turn it up, its bottom half down.

import { type Ctx, INK, box, text, stamp } from './art/kit';

export interface PuzzleIn {
  /** Fresh presses (with auto-repeat on a held direction). */
  left: boolean; right: boolean; up: boolean; down: boolean; ok: boolean;
  /** A mouse click this frame, on the game's 800 x 600 canvas. */
  click: { x: number; y: number } | null;
}
/** What happened this step (hack.ts plays its sound). */
export type PuzzleEvent = 'none' | 'move' | 'turn' | 'solved';
export interface Area { x: number; y: number; w: number; h: number }
export interface HackPuzzle {
  /** One frame of it. */
  step(i: PuzzleIn): PuzzleEvent;
  /** On the CRT's glass (green phosphor: the terminal's look is round it). */
  draw(c: Ctx, f: number, crt: Area): void;
  /** Anything it has out on the bezel, off the glass (the sticky note). */
  drawBezel?(c: Ctx, f: number): void;
  solved(): boolean;
}

/** Which puzzle the panel runs. */
export const newPuzzle = (): HackPuzzle => tumblerCipher();

// ---------------------------------------------------------------------------------------------------------------
// The phosphor's colors (shared with the terminal: hackArt.ts)

export const PHOS = ['#03140A', '#0A3A1C', '#13702F', '#22C55E', '#86EFAC', '#DCFCE7'];
export const AMBER = '#FBBF24';

// ---------------------------------------------------------------------------------------------------------------
// The tumbler cipher

const WORD = 'RAPTOR';
/** Each wheel's letters, round it (its letter of WORD among them). */
const RINGS = ['KRXEMOAS', 'TSAWNBOE', 'OPGLRXTU', 'NEOTSKAD', 'BXRFOLEP', 'AERMTZOS'];
/** Where each starts (none of them right, and the links make the first few turns stir up the rest). */
const START = [5, 0, 4, 1, 1, 6];
/** How long before the screen helps: the right wheels lit, then the letters written under the runes (frames). */
const HINT_LIT = 45 * 60, HINT_SPELL = 90 * 60;

/** The park's dino runes, 5 x 5: the key's letters (the password's five and some that aren't). */
const RUNES: Record<string, string[]> = {
  R: ['#.#.#', '#.#.#', '.###.', '..#..', '.#.#.'],
  A: ['..#..', '.#.#.', '#...#', '#.#.#', '..#..'],
  P: ['###..', '#.#..', '#.###', '....#', '..###'],
  T: ['#...#', '.#.#.', '..#..', '.###.', '#####'],
  O: ['.###.', '#...#', '#.#.#', '#...#', '.###.'],
  E: ['#####', '..#..', '#.#.#', '..#..', '#####'],
  S: ['##...', '.##..', '..##.', '...##', '#...#'],
  K: ['..#..', '#####', '..#..', '.#.#.', '#...#'],
  N: ['##.##', '#...#', '..#..', '#...#', '##.##'],
  M: ['#.#.#', '.#.#.', '#.#.#', '.#.#.', '#.#.#'],
};
/** The key's order on the note (jumbled, so it has to be looked up). */
const KEY = ['E', 'T', 'K', 'A', 'N', 'R', 'M', 'O', 'S', 'P'];

export const drawRune = (c: Ctx, ch: string, x: number, y: number, s: number, col: string) => {
  const g = RUNES[ch];
  if (!g) return;
  c.fillStyle = col;
  for (let r = 0; r < 5; r++) for (let q = 0; q < 5; q++) if (g[r][q] === '#') c.fillRect(Math.round(x + q * s), Math.round(y + r * s), Math.ceil(s), Math.ceil(s));
};

/** Where the wheels are on the glass (the same for drawing and for the mouse). */
const WHEEL_W = 58, WHEEL_H = 120, WHEEL_GAP = 20;
const wheelsAt = (crt: Area) => {
  const total = RINGS.length * WHEEL_W + (RINGS.length - 1) * WHEEL_GAP;
  const x0 = crt.x + (crt.w - total) / 2, y = crt.y + 150;
  return RINGS.map((_, i) => ({ x: x0 + i * (WHEEL_W + WHEEL_GAP), y, w: WHEEL_W, h: WHEEL_H }));
};
/** The CRT's glass as hackArt lays it out (so a click can find a wheel before the first draw). */
export const CRT: Area = { x: 120, y: 92, w: 560, h: 360 };

const tumblerCipher = (): HackPuzzle => {
  const pos = [...START];
  let sel = 0, t = 0, done = false;
  /** Frames since each wheel last turned (its roll), and which way. */
  const roll = RINGS.map(() => ({ t: 99, d: 0 }));
  const at = (i: number) => RINGS[i][((pos[i] % 8) + 8) % 8];
  const right = (i: number) => at(i) === WORD[i];
  const turn = (i: number, d: number) => {
    pos[i] += d; roll[i] = { t: 0, d };
    // (the link: it takes the next one round with it)
    if (i + 1 < RINGS.length) { pos[i + 1] += d; roll[i + 1] = { t: 0, d }; }
  };
  return {
    solved: () => done,
    step: (inp) => {
      t++;
      for (const r of roll) r.t++;
      if (done) return 'none';
      let ev: PuzzleEvent = 'none';
      if (inp.left) { sel = (sel + RINGS.length - 1) % RINGS.length; ev = 'move'; }
      if (inp.right) { sel = (sel + 1) % RINGS.length; ev = 'move'; }
      if (inp.up) { turn(sel, -1); ev = 'turn'; }
      if (inp.down || inp.ok) { turn(sel, 1); ev = 'turn'; }
      if (inp.click) {
        const ws = wheelsAt(CRT);
        ws.forEach((w, i) => {
          if (inp.click!.x < w.x - 6 || inp.click!.x > w.x + w.w + 6 || inp.click!.y < w.y - 20 || inp.click!.y > w.y + w.h + 20) return;
          sel = i; turn(i, inp.click!.y < w.y + w.h / 2 ? -1 : 1); ev = 'turn';
        });
      }
      if (ev === 'turn' && RINGS.every((_, i) => right(i))) { done = true; return 'solved'; }
      return ev;
    },
    draw: (c, f, crt) => {
      const lit = t > HINT_LIT, spell = t > HINT_SPELL;
      const cx = crt.x + crt.w / 2;
      text(c, 'GATE LOCK: PASSWORD ENCRYPTED', cx, crt.y + 30, PHOS[4], 10, 'center', null);
      text(c, 'DECODE IT. USE THE KEY.', cx, crt.y + 48, PHOS[3], 8, 'center', null);
      const ws = wheelsAt(crt);
      // The password, in runes (over its wheels)
      ws.forEach((w, i) => {
        const rx = w.x + w.w / 2 - 15, ry = crt.y + 70;
        box(c, w.x + 4, ry - 6, w.w - 8, 42, PHOS[1]);
        box(c, w.x + 5, ry - 5, w.w - 10, 40, PHOS[0]);
        drawRune(c, WORD[i], rx, ry, 6, PHOS[4]);
        if (spell) text(c, WORD[i], w.x + w.w / 2, ry + 52, AMBER, 8, 'center', null);
      });
      // The wheels: the letter it's on, big, the ones either side dim; rolling a moment when turned
      ws.forEach((w, i) => {
        const on = i === sel, ok = lit && right(i);
        const frame = ok ? PHOS[5] : on ? PHOS[4] : PHOS[2];
        box(c, w.x - 3, w.y - 3, w.w + 6, w.h + 6, on && (f >> 4) % 2 ? PHOS[5] : frame);
        box(c, w.x, w.y, w.w, w.h, ok ? '#0E3A1E' : PHOS[0]);
        // (the drum's curve: bands darker top and bottom)
        box(c, w.x, w.y, w.w, 14, '#020A05'); box(c, w.x, w.y + w.h - 14, w.w, 14, '#020A05');
        const r = roll[i], k = r.t < 6 ? (1 - r.t / 6) * r.d * 24 : 0;
        c.save(); c.beginPath(); c.rect(w.x, w.y, w.w, w.h); c.clip();
        for (const d of [-2, -1, 0, 1, 2]) {
          const ch = RINGS[i][(((pos[i] + d) % 8) + 8) % 8];
          const y = w.y + w.h / 2 + 12 + d * 40 + k;
          text(c, ch, w.x + w.w / 2, y, d === 0 ? (ok ? PHOS[5] : PHOS[4]) : PHOS[2], d === 0 ? 24 : 14, 'center', null);
        }
        c.restore();
        // (its arrows, up and down)
        const ax = w.x + w.w / 2, col = on ? PHOS[4] : PHOS[2];
        c.fillStyle = col;
        c.beginPath(); c.moveTo(ax, w.y - 16); c.lineTo(ax + 7, w.y - 8); c.lineTo(ax - 7, w.y - 8); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(ax, w.y + w.h + 16); c.lineTo(ax + 7, w.y + w.h + 8); c.lineTo(ax - 7, w.y + w.h + 8); c.closePath(); c.fill();
        // The link to the next: a chain across the gap, its links moving as they turn
        if (i + 1 < ws.length) {
          const lx = w.x + w.w + 3, ly = w.y + w.h / 2, sh = r.t < 8 ? Math.round((r.t / 2) * r.d) : 0;
          for (let q = 0; q < 3; q++) { box(c, lx + 2 + q * 5, ly - 3 + ((q + sh) % 2 ? -2 : 2), 4, 6, PHOS[3]); box(c, lx + 3 + q * 5, ly - 2 + ((q + sh) % 2 ? -2 : 2), 2, 4, PHOS[0]); }
          c.fillStyle = PHOS[3]; c.beginPath(); c.moveTo(lx + 17, ly - 5); c.lineTo(lx + 17, ly + 5); c.lineTo(lx + 20, ly); c.closePath(); c.fill();
        }
      });
      const by = crt.y + crt.h - 40;
      text(c, 'WHEELS ARE LINKED: EACH ONE TURNS THE NEXT', cx, by, PHOS[3], 7, 'center', null);
      if (lit) text(c, spell ? 'DECRYPTION ASSIST: IT SAYS RAPTOR, DUMBASS' : 'DECRYPTION ASSIST: ON', cx, by + 16, AMBER, 7, 'center', null);
    },
    drawBezel: (c, f) => {
      // The maintenance man's key: a sticky note taped on the bezel, bottom left (painted once)
      void f;
      stamp(c, 'hack-note', 2, 380, 120, 214, g => {
        const x = 8, y = 388, w = 108, h = 198;
        box(g, x + 4, y + 4, w, h, 'rgba(0, 0, 0, 0.45)');
        box(g, x - 1, y - 1, w + 2, h + 2, INK);
        box(g, x, y, w, h, '#FDE68A'); box(g, x, y, w, 14, '#FCD34D'); box(g, x, y + h - 4, w, 4, '#F5C542');
        // (a coffee ring, a bit of tape)
        g.strokeStyle = 'rgba(120, 70, 20, 0.35)'; g.lineWidth = 3; g.beginPath(); g.arc(x + 78, y + 150, 18, 0.3, 5.6); g.stroke();
        box(g, x + 36, y - 6, 36, 10, 'rgba(240, 240, 230, 0.75)');
        text(g, 'PASSWORD', x + w / 2, y + 12, '#7C2D12', 7, 'center', null);
        text(g, 'KEY - GARY', x + w / 2, y + 24, '#7C2D12', 7, 'center', null);
        KEY.forEach((ch, i) => {
          const col = i % 2, row = Math.floor(i / 2), kx = x + 7 + col * 52, ky = y + 36 + row * 31;
          drawRune(g, ch, kx, ky, 4, '#1E3A8A');
          text(g, `=${ch}`, kx + 34, ky + 15, '#1E3A8A', 9, 'center', null);
        });
      });
    },
  };
};
